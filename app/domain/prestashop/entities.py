from dataclasses import dataclass
from datetime import datetime

@dataclass
class PaymentMethod:
    method: str
    last_payment_dt: datetime | None  # timezone-aware
    hours_since_last: float
    status: str  # ok | warning | critical
