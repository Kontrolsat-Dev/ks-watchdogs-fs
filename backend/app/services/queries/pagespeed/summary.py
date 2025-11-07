from __future__ import annotations
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import re
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repos.prestashop.pagespeed_read import PageSpeedReadRepo

TZ = ZoneInfo(settings.TIMEZONE)
_WIN_RE = re.compile(r"^\s*(\d+)\s*([smhdw])\s*$")

def _parse_window(window: str) -> timedelta:
    m = _WIN_RE.match(window or "")
    if not m:
        return timedelta(hours=24)
    n = int(m.group(1))
    unit = m.group(2).lower()
    seconds = {"s": 1, "m": 60, "h": 3600, "d": 86400, "w": 604800}[unit]
    return timedelta(seconds=n * seconds)

def _pct(values: list[int], p: float) -> int:
    vals = [int(v) for v in values if v is not None]
    if not vals:
        return 0
    vals.sort()
    idx = int(round(p * (len(vals) - 1)))
    return vals[idx]

def _downsample_even(series: list[dict], max_points: int) -> list[dict]:
    n = len(series)
    if max_points <= 0 or n <= max_points:
        return series
    step = (n - 1) / (max_points - 1)
    idxs = sorted({int(round(i * step)) for i in range(max_points)})
    return [series[i] for i in idxs]

def get_pagespeed_summary(db: Session, window: str, max_points: int = 120) -> dict:
    repo = PageSpeedReadRepo(db)
    now = datetime.now(TZ)
    since = now - _parse_window(window)

    # percentis por tipo de página
    home_vals = repo.ttfb_since("home", since)
    prod_vals = repo.ttfb_since("product", since)

    home = {
        "p50_ttfb_ms": _pct(home_vals, 0.50),
        "p90_ttfb_ms": _pct(home_vals, 0.90),
        "p95_ttfb_ms": _pct(home_vals, 0.95),
        "last_status": repo.last_status("home") or "ok",
    }
    product = {
        "p50_ttfb_ms": _pct(prod_vals, 0.50),
        "p90_ttfb_ms": _pct(prod_vals, 0.90),
        "p95_ttfb_ms": _pct(prod_vals, 0.95),
        "last_status": repo.last_status("product") or "ok",
    }

    # série unificada e limitada
    raw_series = repo.series_since(["home", "product"], since)
    series = _downsample_even(raw_series, max_points)

    return {
        "home": home,
        "product": product,
        "series": series,
    }
