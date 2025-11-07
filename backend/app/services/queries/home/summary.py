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

class HomeSummaryService:
    def __init__(self, db: Session):
        self.db = db

    def build(self, *, window: str, sections: Optional[str]) -> HomeSummaryOut:
        want = _parse_sections(sections)
        now = datetime.now(timezone.utc).isoformat()

        out = HomeSummaryOut(
            now_iso=now,
            last_update_iso=now,
        )

        errors: Dict[str, Optional[str]] = {}

        if "runs" in want:
            try:
                runs_svc = RunsQueryService(self.db)
                latest = runs_svc.list(limit=1000)
                by_check: Dict[str, CheckCardOut] = {}
                for r in latest:
                    if r.check_name in by_check:
                        continue
                    by_check[r.check_name] = CheckCardOut(
                        name=r.check_name,
                        last_status=_coerce_run_status(r.status),
                        last_run_ms=r.duration_ms,
                        last_run_at=r.created_at,
                    )
                out.checks = list(by_check.values())
                errors["runs"] = None
            except Exception as e:
                errors["runs"] = str(e)[:200]

        if "kpis" in want:
            try:
                out.kpis["payments"] = get_payments_summary(self.db, window)
            except Exception as e:
                errors["payments"] = str(e)[:200]
            try:
                out.kpis["orders_delayed"] = get_orders_summary(self.db, window)
            except Exception as e:
                errors["orders_delayed"] = str(e)[:200]
            try:
                out.kpis["pagespeed"] = get_pagespeed_summary(self.db, window)
            except Exception as e:
                errors["pagespeed"] = str(e)[:200]
            try:
                out.kpis["carts_stale"] = get_carts_summary(self.db, window)
            except Exception as e:
                errors["carts_stale"] = str(e)[:200]
            try:
                out.kpis["eol"] = get_eol_summary(self.db, window)
            except Exception as e:
                errors["eol"] = str(e)[:200]

        out.errors = errors
        return out
