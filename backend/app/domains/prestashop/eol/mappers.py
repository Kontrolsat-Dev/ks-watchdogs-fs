from datetime import datetime
from decimal import Decimal, InvalidOperation
from app.shared.status import Status
from .types import EOLProduct
from .rules import classify_eol_days

def _parse_dt_local(dt_str: str | None, tz):
    if not dt_str:
        return None
    try:
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=tz)
    except Exception:
        return None

def _status_from_severity_str(s: str | None) -> Status | None:
    if not s: return None
    s = s.lower().strip()
    if s == "critical": return Status.CRITICAL
    if s == "warning":  return Status.WARNING
    if s == "ok":       return Status.OK
    return None

def raw_eol_row_to_entity(
    row: dict,
    tz,
    warn_days: int,
    crit_days: int,
) -> EOLProduct:
    days = int(row.get("days_since") or 0)
    st = _status_from_severity_str(str(row.get("severity") or "")) or classify_eol_days(days, warn_days, crit_days)

    try:
        price = Decimal(str(row.get("price") or "0"))
    except InvalidOperation:
        price = Decimal("0")

    return EOLProduct(
        id_product=int(row["id_product"]),
        name=str(row.get("name") or ""),
        reference=str(row.get("reference") or ""),
        ean13=str(row.get("ean13") or ""),
        upc=str(row.get("upc") or ""),
        price=price,
        last_in_stock_at=_parse_dt_local(row.get("last_in_stock_at"), tz),
        days_since=days,
        status=st,
    )
