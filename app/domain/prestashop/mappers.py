from datetime import datetime
from zoneinfo import ZoneInfo
from app.core.config import settings
from app.core.classifier import classify_by_hours, Classification
from .entities import PaymentMethod
from .dto import PaymentMethodDTO
from ...core.timeutils import get_local_tz

ALIASES = {
    "Credit Card": "Cartão de Crédito",
    "MBWay": "MB Way",
    "ATM References": "Referências Multibanco",
}


def _parse_local_dt(dt_str: str) -> datetime | None:
    if not dt_str:
        return None
    try:
        tz = get_local_tz(settings.TIMEZONE)
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=tz)
    except Exception:
        return None


def raw_row_to_domain(row: dict, now_dt: datetime) -> PaymentMethod:
    method_raw = str(row.get("method", "Desconhecido"))
    method = ALIASES.get(method_raw, method_raw)

    last_dt = _parse_local_dt(str(row.get("last_payment_date", "")))
    hours = float("inf") if last_dt is None else (now_dt - last_dt).total_seconds() / 3600.0
    status = classify_by_hours(hours, settings.PS_PAYMENTS_WARNING_HOURS, settings.PS_PAYMENTS_CRITICAL_HOURS)

    return PaymentMethod(
        method=method,
        last_payment_dt=last_dt,
        hours_since_last=(round(hours, 1) if hours != float("inf") else hours),
        status=status,
    )


def domain_to_dto(pm: PaymentMethod) -> PaymentMethodDTO:
    last_str = pm.last_payment_dt.strftime("%Y-%m-%d %H:%M:%S") if pm.last_payment_dt else "1970-01-01 00:00:00"
    return PaymentMethodDTO(
        method=pm.method,
        last_payment_date=last_str,
        hours_since_last=pm.hours_since_last,
        status=pm.status,
    )
