from pydantic import BaseModel, Field
from typing import Literal, List

Status = Literal["ok", "warning", "critical"]

class PaymentMethodDTO(BaseModel):
    method: str
    last_payment_date: str = Field(..., description="YYYY-MM-DD HH:MM:SS (hora local)")
    hours_since_last: float
    status: Status

class PaymentsResponseDTO(BaseModel):
    ok: bool
    generated_at: str
    methods: List[PaymentMethodDTO]