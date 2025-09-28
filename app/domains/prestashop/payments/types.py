from dataclasses import dataclass
from datetime import datetime
from typing import Literal

Status = Literal['ok', 'warning', 'critical']

@dataclass
class PaymentMethod:
    method:str
    last_payment_at:datetime | None
    hours_since_last:float
    status: Status