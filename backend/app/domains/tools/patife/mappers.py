# app/domains/tools/patife/mappers.py
# Mapeadores para o domínio Patife.

from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Optional
from .types import PatifeHealthzSnapshot


def _as_float(x: Any) -> Optional[float]:
    try:
        return float(x)
    except Exception:
        return None


def _as_int(x: Any) -> Optional[int]:
    try:
        return int(x)
    except Exception:
        return None


def _as_bool(x: Any) -> Optional[bool]:
    if x is None:
        return None
    if isinstance(x, bool):
        return x
    s = str(x).strip().lower()
    if s in {"true", "1", "yes"}:
        return True
    if s in {"false", "0", "no"}:
        return False
    return None


def raw_to_domain(payload: dict) -> PatifeHealthzSnapshot:
    status = str(payload.get("status", "")).strip().lower() or "unknown"
    is_online = status == "ok"

    # time pode vir em "YYYY-MM-DD HH:MM:SS" local; se não, usa agora()
    raw_time = payload.get("time")
    dt: datetime
    try:
        # tenta ISO primeiro
        dt = datetime.fromisoformat(str(raw_time))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
    except Exception:
        try:
            # "YYYY-MM-DD HH:MM:SS"
            dt = datetime.strptime(
                str(raw_time), "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        except Exception:
            dt = datetime.now(tz=timezone.utc)

    checks = payload.get("checks") or {}
    db = checks.get("db") or {}
    cache = checks.get("cache") or {}
    disk = checks.get("disk") or {}

    meta = payload.get("meta") or {}

    return PatifeHealthzSnapshot(
        status=status,
        time=dt,
        duration_ms=_as_float(payload.get("duration_ms")) or 0.0,

        db_ok=_as_bool(db.get("ok")),
        db_latency_ms=_as_float(db.get("latency_ms")),
        db_error=(db.get("error") or None),

        cache_ok=_as_bool(cache.get("ok")),
        cache_error=(cache.get("error") or None),

        disk_ok=_as_bool(disk.get("ok")),
        disk_free_bytes=_as_int(disk.get("free_bytes")),
        disk_total_bytes=_as_int(disk.get("total_bytes")),
        disk_mount=(disk.get("mount") or None),
        disk_error=(disk.get("error") or None),

        php=(meta.get("php") or None),
        sapi=(meta.get("sapi") or None),
        env=(meta.get("env") or None),
        app=(meta.get("app") or None),

        is_online=is_online,
    )
