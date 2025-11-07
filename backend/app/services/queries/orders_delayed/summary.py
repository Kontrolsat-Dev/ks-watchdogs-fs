from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, Any
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.core.config import settings
from app.repos.prestashop.orders_read import OrdersReadRepo

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

def get_orders_summary(db: Session, window: str) -> Dict[str, Any]:
    since_dt = _since(window)
    repo = OrdersReadRepo(db)

    counts = repo.latest_counts_by_type()
    total = counts["total"]
    by_type = {"std": counts["std"], "dropship": counts["dropship"]}

    series = repo.daily_series_since(since_dt)
    if len(series) >= 2:
        delta_24h = series[-1]["total"] - series[-2]["total"]
    elif len(series) == 1:
        delta_24h = series[-1]["total"]
    else:
        delta_24h = 0

    return {"total": total, "by_type": by_type, "delta_24h": delta_24h, "series": series}

def get_delayed_orders_summary(db: Session, window: str) -> Dict[str, Any]:
    return get_orders_summary(db, window)
