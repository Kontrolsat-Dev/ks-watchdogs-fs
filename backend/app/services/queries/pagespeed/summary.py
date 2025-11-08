from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, List

from sqlalchemy.orm import Session

from app.repos.prestashop.pagespeed_read import PageSpeedReadRepo

def _since_from_window(window: str) -> datetime:
    w = (window or "24h").lower().strip()
    now = datetime.now(timezone.utc)
    if w.endswith("h"):
        h = int(w[:-1] or 0) or 24
        return now - timedelta(hours=h)
    if w.endswith("d"):
        d = int(w[:-1] or 0) or 1
        return now - timedelta(days=d)
    return now - timedelta(hours=24)

def _pct(values: List[int], p: float) -> int:
    vals = [int(v) for v in values if v is not None]
    if not vals:
        return 0
    vals.sort()
    idx = int(round(p * (len(vals) - 1)))
    return vals[idx]

def _floor_bucket(dt: datetime, minutes: int) -> datetime:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    m = (dt.minute // minutes) * minutes
    return dt.replace(minute=m, second=0, microsecond=0)

def _bucket_series(series: List[Dict], bucket_minutes: int) -> List[Dict]:
    """
    Recebe [{ts, home_ttfb_ms?, product_ttfb_ms?}, ...]
    Faz bucket por 'bucket_minutes' e calcula média no bucket.
    """
    from collections import defaultdict

    acc: Dict[str, Dict[str, float]] = {}
    cnt: Dict[str, Dict[str, int]] = defaultdict(lambda: {"home": 0, "product": 0})

    for row in series:
        raw_ts = row.get("ts")
        try:
            dt = datetime.fromisoformat(str(raw_ts))
        except Exception:
            # fallback tosco, deixa como string original (vira chave)
            k = str(raw_ts)
            if k not in acc:
                acc[k] = {"ts": k, "home_ttfb_ms": 0.0, "product_ttfb_ms": 0.0}
            for key, tag in (("home_ttfb_ms", "home"), ("product_ttfb_ms", "product")):
                if key in row and row[key] is not None:
                    acc[k][key] = acc[k].get(key, 0.0) + float(row[key] or 0)
                    cnt[k][tag] += 1
            continue

        bdt = _floor_bucket(dt, max(1, bucket_minutes))
        k = bdt.isoformat()
        if k not in acc:
            acc[k] = {"ts": k, "home_ttfb_ms": 0.0, "product_ttfb_ms": 0.0}
        if "home_ttfb_ms" in row and row["home_ttfb_ms"] is not None:
            acc[k]["home_ttfb_ms"] += float(row["home_ttfb_ms"] or 0)
            cnt[k]["home"] += 1
        if "product_ttfb_ms" in row and row["product_ttfb_ms"] is not None:
            acc[k]["product_ttfb_ms"] += float(row["product_ttfb_ms"] or 0)
            cnt[k]["product"] += 1

    # média por bucket
    out = []
    for k in sorted(acc.keys()):
        slot = acc[k]
        h_n = max(1, cnt[k]["home"])
        p_n = max(1, cnt[k]["product"])
        out.append({
            "ts": slot["ts"],
            "home_ttfb_ms": int(round(slot["home_ttfb_ms"] / h_n)) if cnt[k]["home"] else None,
            "product_ttfb_ms": int(round(slot["product_ttfb_ms"] / p_n)) if cnt[k]["product"] else None,
        })
    return out

def _downsample_even(series: List[Dict], max_points: int) -> List[Dict]:
    n = len(series)
    if max_points <= 0 or n <= max_points:
        return series
    step = (n - 1) / (max_points - 1)
    idxs = sorted({int(round(i * step)) for i in range(max_points)})
    return [series[i] for i in idxs]

def get_pagespeed_summary(
    db: Session,
    window: str,
    *,
    bucket_minutes: int = 5,
    max_points: int = 220,
) -> dict:
    """
    Mantém o formato atual:
    {
      "home": {p50_ttfb_ms,p90_ttfb_ms,p95_ttfb_ms,last_status},
      "product": {...},
      "series": [{ts, home_ttfb_ms?, product_ttfb_ms?}, ...]
    }
    """
    repo = PageSpeedReadRepo(db)
    since = _since_from_window(window)

    # percentis por tipo de página (com base em TTFB bruto filtrado por janela)
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

    # série unificada → bucketização → downsample
    raw_series = repo.series_since(["home", "product"], since)  # [{ts, home_ttfb_ms?, product_ttfb_ms?}, ...]
    bucketed = _bucket_series(raw_series, bucket_minutes=bucket_minutes)
    series = _downsample_even(bucketed, max_points=max_points)

    return {
        "home": home,
        "product": product,
        "series": series,
    }
