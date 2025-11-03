# app/domains/patife/types.py

from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(slots=True)
class PatifeHealthzSnapshot:
    status: str
    time: datetime
    duration_ms: float

    # Checks
    db_ok: Optional[bool]
    db_latency_ms: Optional[float]
    db_error: Optional[str]

    cache_ok: Optional[bool]
    cache_error: Optional[str]

    disk_ok: Optional[bool]
    disk_free_bytes: Optional[int]
    disk_total_bytes: Optional[int]
    disk_mount: Optional[str]
    disk_error: Optional[str]

    # meta
    php: Optional[str]
    sapi: Optional[str]
    env: Optional[str]
    app: Optional[str]

    is_online: bool
