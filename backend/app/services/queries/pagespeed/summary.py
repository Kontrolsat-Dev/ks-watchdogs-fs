from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, Any, List
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.core.config import settings
from app.repos.prestashop.pagespeed_read import PageSpeedReadRepo

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

def _percentile(values: List[int], p: float) -> int:
    if not values:
        return 0
    vals = sorted(values)
    k = (len(vals) - 1) * p
    f = int(k)
    c = min(f + 1, len(vals) - 1)
    if f == c:
        return int(vals[int(k)])
    d0 = vals[f] * (c - k)
    d1 = vals[c] * (k - f)
    return int(d0 + d1)

def _summ(repo: PageSpeedReadRepo, since_dt, page_type: str) -> Dict[str, Any]:
    ttfb = repo.ttfb_since(page_type, since_dt)
    last = repo.last_status(page_type) or "ok"
    return {
        "p50_ttfb_ms": _percentile(ttfb, 0.50),
        "p90_ttfb_ms": _percentile(ttfb, 0.90),
        "p95_ttfb_ms": _percentile(ttfb, 0.95),
        "last_status": "ok" if last != "error" else "error",
    }

def get_pagespeed_summary(db: Session, window: str) -> Dict[str, Any]:
    since_dt = _since(window)
    repo = PageSpeedReadRepo(db)
    home = _summ(repo, since_dt, "home")
    product = _summ(repo, since_dt, "product")
    series = repo.series_since(["home", "product"], since_dt)
    return {"home": home, "product": product, "series": series}
