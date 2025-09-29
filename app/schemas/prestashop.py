from pydantic import BaseModel, ConfigDict
from typing import List
from app.shared.status import Status

class PaymentMethodDTO(BaseModel):
    model_config = ConfigDict(use_enum_values=True)  # exporta "ok"/"warning"/"critical"
    method: str
    last_payment_at: str | None
    hours_since_last: float
    status: Status
    observed_at: str

class PaymentsListDTO(BaseModel):
    ok: bool
    count: int
    methods: List[PaymentMethodDTO]

class DelayedOrderDTO(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    id_order: int
    reference: str
    date_add: str
    days_passed: int
    id_state: int
    state_name: str
    dropshipping: bool
    status: Status
    observed_at: str

class DelayedOrdersListDTO(BaseModel):
    ok: bool
    count: int
    orders: List[DelayedOrderDTO]
