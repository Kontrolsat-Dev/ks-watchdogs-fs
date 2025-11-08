from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.schemas.home import HomeSummaryOut, CheckCardOut
from app.services.queries.runs.runs import RunsQueryService
from app.services.queries.payments.summary import get_payments_summary
from app.services.queries.orders_delayed.summary import get_orders_summary
from app.services.queries.pagespeed.summary import get_pagespeed_summary
from app.services.queries.carts.summary import get_carts_summary
from app.services.queries.eol.summary import get_eol_summary

# teto de pontos por janela (para séries de PageSpeed)
WINDOW_MAX_POINTS: Dict[str, int] = {
    "6h": 180,   # ~1 ponto / 2 min
    "12h": 240,  # ~1 ponto / 3 min
    "24h": 288,  # ~1 ponto / 5 min
    "3d": 336,   # ~1 ponto / 12–15 min
    "7d": 336,   # idem, UI mais leve
}

def _parse_sections(sections: Optional[str]) -> set[str]:
    if not sections:
        return {"runs", "kpis"}
    return {s.strip() for s in sections.split(",") if s.strip()}

def _coerce_run_status(s: Optional[str]) -> str:
    s = (s or "").lower().strip()
    if s in {"ok", "error"}:
        return s
    if s in {"warning", "critical"}:
        return "ok"
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
        now_iso = datetime.now(timezone.utc).isoformat()

        # Garante defaults (checks=[], kpis={}, errors={})
        out = HomeSummaryOut(
            now_iso=now_iso,
            last_update_iso=now_iso,
        )

        errors: Dict[str, Optional[str]] = {}

        # -------- Runs / Checks --------
        if "runs" in want:
            try:
                runs_svc = RunsQueryService(self.db)
                # reduz um pouco o limite para tornar a primeira dobra mais leve
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

                # Ordena por nome para UI consistente
                out.checks = sorted(by_check.values(), key=lambda x: x.name.lower())
                errors["runs"] = None
            except Exception as e:
                errors["runs"] = str(e)[:200]

        # -------- KPIs --------
        if "kpis" in want:
            # garante dict existente
            if out.kpis is None:
                out.kpis = {}

            # payments
            try:
                out.kpis["payments"] = get_payments_summary(self.db, window)
            except Exception as e:
                errors["payments"] = str(e)[:200]

            # orders_delayed
            try:
                out.kpis["orders_delayed"] = get_orders_summary(self.db, window)
            except Exception as e:
                errors["orders_delayed"] = str(e)[:200]

            # pagespeed (com hints de performance)
            try:
                out.kpis["pagespeed"] = get_pagespeed_summary(
                    self.db,
                    window,
                    bucket_minutes=_pick_bucket_minutes(window),
                    max_points=WINDOW_MAX_POINTS.get(window, 240),
                )
            except Exception as e:
                errors["pagespeed"] = str(e)[:200]

            # carts_stale
            try:
                out.kpis["carts_stale"] = get_carts_summary(self.db, window)
            except Exception as e:
                errors["carts_stale"] = str(e)[:200]

            # eol
            try:
                out.kpis["eol"] = get_eol_summary(self.db, window)
            except Exception as e:
                errors["eol"] = str(e)[:200]

        out.errors = errors
        return out
