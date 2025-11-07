# app/services/queries/payments/summary.py
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import re
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repos.prestashop.payments_read import PaymentsReadRepo  # garante que existe
# Se o nome do repo for diferente, ajusta a import e a chamada abaixo.

TZ = ZoneInfo(settings.TIMEZONE)

_WIN_RE = re.compile(r"^\s*(\d+)\s*([smhdw])\s*$")

def _parse_window(window: str) -> timedelta:
    m = _WIN_RE.match(window or "")
    if not m:
        return timedelta(hours=24)
    n = int(m.group(1))
    unit = m.group(2)
    mult = {"s":1, "m":60, "h":3600, "d":86400, "w":604800}[unit]
    return timedelta(seconds=n * mult)

def _ensure_aware(dt: datetime | None, tz: ZoneInfo) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=tz)  # assume que o naive está em TZ local; se guardas em UTC, troca por timezone.utc
    return dt.astimezone(tz)

def get_payments_summary(db: Session, window: str) -> dict:
    repo = PaymentsReadRepo(db)
    now = datetime.now(TZ)
    # usa since se precisares para séries; aqui apenas último por método
    _since = now - _parse_window(window)

    rows = repo.latest_by_method()  # tem de devolver pelo menos: method, last_payment_at
    out = {"last_per_method": []}

    for r in rows:
        lp = _ensure_aware(r.get("last_payment_at"), TZ)
        last_iso = lp.isoformat() if lp else None
        age_minutes = None
        if lp is not None:
            # ambas aware -> ok
            delta = now - lp
            # proteção se lp > now (clocks off): clamp a zero
            total_sec = max(0, int(delta.total_seconds()))
            age_minutes = total_sec // 60

        out["last_per_method"].append({
            "method": r.get("method"),
            "last_payment_at": last_iso,
            "age_minutes": age_minutes,
        })

    return out
