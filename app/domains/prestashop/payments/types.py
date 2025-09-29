from dataclasses import dataclass
from datetime import datetime
from app.shared.status import Status

@dataclass(slots=True)
class PaymentMethod:
    method: str
    last_payment_at: datetime | None
    hours_since_last: float
    status: Status
