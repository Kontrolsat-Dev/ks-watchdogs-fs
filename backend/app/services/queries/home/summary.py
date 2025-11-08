from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
import time
import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.home import HomeSummaryOut, CheckCardOut
from app.services.queries.runs.runs import RunsQueryService
from app.services.queries.payments.summary import get_payments_summary
from app.services.queries.orders_delayed.summary import get_orders_summary
from app.services.queries.pagespeed.summary import get_pagespeed_summary
from app.services.queries.carts.summary import get_carts_summary
from app.services.queries.eol.summary import get_eol_summary

WINDOW_MAX_POINTS: Dict[str, int] = {
    "6h": 180, "12h": 240, "24h": 288, "3d": 336, "7d": 336,
}

log = logging.getLogger("watchdogs.home")
_CACHE: Dict[Tuple[str, str], Tuple[float, HomeSummaryOut]] = {}
_TTL = getattr(settings, "HOME_SUMMARY_TTL_SECONDS", 30)  # default 30s

def _parse_sections(sections: Optional[str]) -> set[str]:
    if not sections:
        return {"runs", "kpis"}
    return {s.strip() for s in sections.split(",") if s.strip()}

def _coerce_run_status(s: Optional[str]) -> str:
    s = (s or "").lower().strip()
    if s in {"ok", "error"}: return s
    if s in {"warning", "critical"}: return "ok"
    return "error"

def _as_iso_utc(dt) -> str:
    if dt is None:
        return datetime.now(timezone.utc).isoformat()
    if getattr(dt, "tzinfo", None) is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()

def _pick_bucket_minutes(window: str) -> int:
    w = (window or "").lower()
    if w.endswith("h"):
        h = int(w[:-1] or 0)
        if h <= 3: return 1
        if h <= 12: return 5
        return 10
    if w.endswith("d"):
        d = int(w[:-1] or 0)
        if d <= 2: return 10
        if d <= 7: return 30
        return 60
    return 5

class HomeSummaryService:
    def __init__(self, db: Session):
        self.db = db

    def build(self, *, window: str, sections: Optional[str]) -> HomeSummaryOut:
        want = _parse_sections(sections)
        key = (window or "24h", ",".join(sorted(want)))

        # cache hit?
        now_ts = time.time()
        hit = _CACHE.get(key)
        if hit and (now_ts - hit[0] < _TTL):
            return hit[1]

        t0 = time.perf_counter()
        now_iso = datetime.now(timezone.utc).isoformat()
        out = HomeSummaryOut(now_iso=now_iso, last_update_iso=now_iso)
        errors: Dict[str, Optional[str]] = {}

        # -------- Runs / Checks --------
        t_runs = None
        if "runs" in want:
            t1 = time.perf_counter()
            try:
                runs_svc = RunsQueryService(self.db)
                latest = runs_svc.list(limit=500)
                by_check: Dict[str, CheckCardOut] = {}
                for r in latest:
                    name = getattr(r, "check_name", None)
                    if not name or name in by_check:
                        continue
                    by_check[name] = CheckCardOut(
                        name=name,
                        last_status=_coerce_run_status(getattr(r, "status", None)),
                        last_run_ms=int(getattr(r, "duration_ms", 0) or 0),
                        last_run_at=_as_iso_utc(getattr(r, "created_at", None)),
                    )
                out.checks = sorted(by_check.values(), key=lambda x: x.name.lower())
                errors["runs"] = None
            except Exception as e:
                errors["runs"] = str(e)[:200]
            finally:
                t_runs = (time.perf_counter() - t1) * 1000

        # -------- KPIs --------
        if "kpis" in want:
            if out.kpis is None:
                out.kpis = {}

            def _safe(label, fn):
                t_start = time.perf_counter()
                try:
                    out.kpis[label] = fn()
                    errors[label] = None
                except Exception as e:
                    errors[label] = str(e)[:200]
                return (time.perf_counter() - t_start) * 1000

            # closures p/ medir tempo
            bp = _pick_bucket_minutes(window)
            mp = WINDOW_MAX_POINTS.get(window, 240)

            t_pay = _safe("payments", lambda: get_payments_summary(self.db, window))
            t_ord = _safe("orders_delayed", lambda: get_orders_summary(self.db, window))
            t_ps  = _safe("pagespeed", lambda: get_pagespeed_summary(self.db, window, bucket_minutes=bp, max_points=mp))
            t_cart= _safe("carts_stale", lambda: get_carts_summary(self.db, window))
            t_eol = _safe("eol", lambda: get_eol_summary(self.db, window))

            # logging sintético (não altera resposta)
            log.info("home.summary window=%s timings_ms runs=%s payments=%.1f orders=%.1f pagespeed=%.1f carts=%.1f eol=%.1f total=%.1f",
                     window,
                     f"{t_runs:.1f}" if t_runs is not None else "-",
                     t_pay, t_ord, t_ps, t_cart, t_eol,
                     (time.perf_counter() - t0) * 1000)

        out.errors = errors

        # guarda no cache
        _CACHE[key] = (time.time(), out)
        return out
