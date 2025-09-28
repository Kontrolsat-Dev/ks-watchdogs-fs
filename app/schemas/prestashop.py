from pydantic import BaseModel
from typing import Literal, List

Status = Literal["ok", "warning", "critical"]

class PaymentMethodDTO(BaseModel):
    method: str
    last_payment_at: str | None
    hours_since_last: float
    status: Status
    observed_at: str

class PaymentsListDTO(BaseModel):
    ok: bool
    count: int
    methods: List[PaymentMethodDTO]

