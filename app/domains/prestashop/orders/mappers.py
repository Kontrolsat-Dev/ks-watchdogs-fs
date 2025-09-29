from datetime import datetime
from .types import DelayedOrder
from .rules import classify_order_delay

def parse_local_dt(dt_str: str, tz) -> datetime:
    # mantém simples; se quiseres tornar tolerante, adiciona try/except e fallback
    return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=tz)

def map_order_row_to_entity(
    row: dict,
    tz,
    warn_std: int,
    crit_std: int,
    warn_drop: int,
    crit_drop: int,
) -> DelayedOrder:
    days = int(row.get("days_passed") or 0)
    drops = bool(row.get("dropshipping") or False)
    status = classify_order_delay(days, drops, warn_std, crit_std, warn_drop, crit_drop)
    return DelayedOrder(
        id_order=int(row["id_order"]),
        reference=str(row.get("reference") or ""),
        date_add=parse_local_dt(row["date_add"], tz),
        days_passed=days,
        id_state=int(row.get("id_state") or 0),
        state_name=str(row.get("state_name") or ""),
        dropshipping=drops,
        status=status,  # 👈 enum
    )
