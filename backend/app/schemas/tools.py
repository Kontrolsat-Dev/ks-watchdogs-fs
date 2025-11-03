from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

# -------------------------------c
# PDA
# -------------------------------


class Report(BaseModel):
    id: int
    code: str
    message: str
    context_json: str
    error_text: str
    stack_text: str
    log_mode: str
    ts_client: str
    state: str
    date_added: str
    date_updated: str

# -------------------------------
# Patife
# -------------------------------


class PatifeHealthzDTO(BaseModel):
    id: int
    status: str
    is_online: bool
    time: str
    duration_ms: float

    db_ok: Optional[bool] = None
    db_latency_ms: Optional[float] = None
    db_error: Optional[str] = None

    cache_ok: Optional[bool] = None
    cache_error: Optional[str] = None

    disk_ok: Optional[bool] = None
    disk_free_bytes: Optional[int] = None
    disk_total_bytes: Optional[int] = None
    disk_mount: Optional[str] = None
    disk_error: Optional[str] = None

    php: Optional[str] = None
    sapi: Optional[str] = None
    env: Optional[str] = None
    app: Optional[str] = None
