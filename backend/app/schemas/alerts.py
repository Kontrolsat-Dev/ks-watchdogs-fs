from typing import Any, List, Optional
from pydantic import BaseModel
from app.shared.status import Status  # Enum: OK|WARNING|CRITICAL


class AlertItemDTO(BaseModel):
    key: str
    title: str
    status: Status
    observed_at: str
    payload: Optional[dict[str, Any]] = None


class PrestashopAlertsDTO(BaseModel):
    payments: List[AlertItemDTO]
    delayed_orders: List[AlertItemDTO]
    eol_products: List[AlertItemDTO]


class AlertsCountsDTO(BaseModel):
    payments: int
    delayed_orders: int
    eol_products: int
    total: int


class GroupedAlertsDTO(BaseModel):
    ok: bool
    counts: AlertsCountsDTO
    prestashop: PrestashopAlertsDTO
