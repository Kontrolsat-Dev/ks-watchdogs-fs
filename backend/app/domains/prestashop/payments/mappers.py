from datetime import datetime
from app.domains.prestashop.payments.types import PaymentMethod
from app.shared.status import Status
from .rules import classify_payment_staleness


# Normalização de nomes (podes acrescentar à vontade)
ALIASES = {
    "Credit Card": "Cartão de Crédito",
    "ATM References": "Referências Multibanco",
    "MBWay": "MB Way",
}

def parse_local(dt_str: str, tz) -> datetime | None:
    """
    Converte 'YYYY-MM-DD HH:MM:SS' (hora local) para datetime com tz.
    Se vier vazio ou inválido, retorna None.
    """
    if not dt_str:
        return None
    try:
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=tz)
    except Exception:
        return None

def raw_row_to_domain(
    row: dict,
    now_dt,          # datetime tz-aware (passado pelo service)
    tz,              # timezone (ZoneInfo(...), gettz(...), etc.)
    warn_h: int,
    crit_h: int,
) -> PaymentMethod:
    method_raw = str(row.get("method", "")).strip() or "Desconhecido"
    method = ALIASES.get(method_raw, method_raw)

    last_dt = parse_local(str(row.get("last_payment_date", "")).strip(), tz)
    hours = float("inf") if last_dt is None else (now_dt - last_dt).total_seconds() / 3600.0
    status = classify_payment_staleness(hours, warn_h, crit_h)

    return PaymentMethod(
        method=method,
        last_payment_at=last_dt,
        hours_since_last=(round(hours, 1) if hours != float("inf") else hours),
        status=status,
    )
