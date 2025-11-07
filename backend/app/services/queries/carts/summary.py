from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, Any
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.core.config import settings
from app.repos.prestashop.carts_read import CartsReadRepo

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

def get_carts_summary(db: Session, window: str) -> Dict[str, Any]:
    since_dt = _since(window)
    repo = CartsReadRepo(db)
    over_threshold = repo.distinct_count_since(since_dt)
    series = repo.daily_series_since(since_dt)
    return {"over_threshold": over_threshold, "series": series}
