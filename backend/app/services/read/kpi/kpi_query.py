from datetime import date, timedelta, datetime
from typing import Literal, Optional
from app.core.config import settings
from app.external.prestashop_client import PrestashopClient
from app.domains.kpi.employees.mappers import rows_to_series, raw_to_performance

Gran = Literal["day", "week", "month", "year"]
Role = Literal["prep", "invoice"]
OrderBy = Literal["avg", "n", "min", "max"]
OrderDir = Literal["asc", "desc"]

def _default_since_until(gran: str) -> tuple[str, str]:
    """
    Devolve (since, until) em ISO 'YYYY-MM-DD'.
    until é exclusivo e vai até 'hoje + 1 dia'.
    """
    today = date.today()
    if gran == "day":
        since = today - timedelta(days=30)
    elif gran == "week":
        since = today - timedelta(weeks=26)
    elif gran == "month":
        # últimos 12 meses, alinhado ao início do mês corrente - 12 meses
        since = date(today.year - 1, today.month, 1)
    else:  # "year"
        since = date(today.year - 5, 1, 1)
    until = today + timedelta(days=1)
    return since.isoformat(), until.isoformat()

def _norm_date(s: Optional[str]) -> Optional[str]:
    """Aceita 'YYYY-MM-DD' ou 'DD-MM-YYYY' e devolve 'YYYY-MM-DD'."""
    if not s:
        return s
    for fmt in ("%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(s, fmt).date().isoformat()
        except ValueError:
            continue
    return s  # se vier noutro formato, deixamos como está

class KPIQueryService:
    def __init__(self) -> None:
        pass

    def employees_timeseries(
        self,
        role: Role,
        gran: Gran,
        since: Optional[str],
        until: Optional[str],
    ):
        since = _norm_date(since)
        until = _norm_date(until)

        if since is None or until is None:
            s, u = _default_since_until(gran)
            since = since or s
            until = until or u

        client = PrestashopClient()
        data = client.fetch_kpi_employee_timeseries(
            role=role, gran=gran, since=since, until=until
        )
        series = rows_to_series(role=data["meta"]["role"], rows=data["rows"])

        # flatten para alinhar com o router
        return {
            "role": data["meta"]["role"],
            "gran": data["meta"]["gran"],
            "since": since,
            "until": until,
            "series": series,
        }

    def employees_performance(
        self,
        role: Role,
        since: Optional[str] = None,
        until: Optional[str] = None,
        order_by: OrderBy = "avg",
        order_dir: OrderDir = "asc",
        limit: int = 200,
    ):
        since = _norm_date(since)
        until = _norm_date(until)

        if since is None or until is None:
            s, u = _default_since_until("day")
            since = since or s
            until = until or u

        client = PrestashopClient()
        payload = client.fetch_kpi_employee_performance(
            role=role,
            since=since,
            until=until,
            order_by=order_by,
            order_dir=order_dir,
            limit=limit,
        )
        items = [raw_to_performance(payload["meta"]["role"], r) for r in payload["rows"]]

        return {
            "role": payload["meta"]["role"],
            "since": since,
            "until": until,
            "order_by": payload["meta"]["order_by"] or order_by,
            "order_dir": payload["meta"]["order_dir"] or order_dir,
            "limit": limit,
            "items": items,
        }
