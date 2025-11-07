from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, Any, List
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.core.config import settings
from app.repos.prestashop.payments_read import PaymentsReadRepo

TZ = ZoneInfo(getattr(settings, "TIMEZONE", "Europe/Lisbon"))

def _since(window: str) -> datetime:
    now = datetime.now(TZ)
    w = (window or "24h").lower().strip()
    if w.endswith("d"):
        return now - timedelta(days=int(w[:-1] or "1"))
    if w.endswith("h"):
        return now - timedelta(hours=int(w[:-1] or "1"))
    if w.endswith("m"):
        return now - timedelta(minutes=int(w[:-1] or "1"))
    return now - timedelta(hours=24)

def get_payments_summary(db: Session, window: str) -> Dict[str, Any]:
    since_dt = _since(window)
    repo = PaymentsReadRepo(db)
    warn_h = getattr(settings, "PS_PAYMENTS_WARNING_HOURS", 2)
    crit_h = getattr(settings, "PS_PAYMENTS_CRITICAL_HOURS", 6)

    rows = repo.latest_by_method_since(since_dt)
    now = datetime.now(TZ)
    last_per_method = []
    for r in rows:
        lp = r["last_payment_at"]
        if lp is None:
            hours_since = None
            last_iso = None
        else:
            lp_dt = lp if isinstance(lp, datetime) else datetime.fromisoformat(str(lp))
            hours_since = round((now - lp_dt).total_seconds() / 3600.0, 2)
            last_iso = lp_dt.isoformat()
        last_per_method.append(
            {
                "method": r["method"],
                "last_payment_at": last_iso,
                "hours_since": hours_since,
                "warn_hours": warn_h,
                "crit_hours": crit_h,
            }
        )
    return {"last_per_method": last_per_method}
