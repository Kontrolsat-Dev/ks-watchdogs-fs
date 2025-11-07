from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, Any
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.core.config import settings
from app.repos.prestashop.eol_read import EOLOutReadRepo

TZ = ZoneInfo(getattr(settings, "TIMEZONE", "Europe/Lisbon"))

def _since(window: str) -> datetime:
    now = datetime.now(TZ)
    w = (window or "7d").lower().strip()
    if w.endswith("d"):
        return now - timedelta(days=int(w[:-1] or "1"))
    if w.endswith("h"):
        return now - timedelta(hours=int(w[:-1] or "1"))
    if w.endswith("m"):
        return now - timedelta(minutes=int(w[:-1] or "1"))
    return now - timedelta(days=7)

def get_eol_summary(db: Session, window: str) -> Dict[str, Any]:
    since_dt = _since(window)
    repo = EOLOutReadRepo(db)
    latest_statuses = [str(s or "").lower() for s in repo.latest_status_per_product_since(since_dt)]
    warn = sum(1 for s in latest_statuses if s == "warning")
    critical = sum(1 for s in latest_statuses if s == "critical")
    series = repo.daily_counts_since(since_dt)
    return {"warn": int(warn), "critical": int(critical), "series": series}
