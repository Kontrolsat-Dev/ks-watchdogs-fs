from dataclasses import dataclass
from datetime import datetime
from app.shared.status import Status

@dataclass(slots=True)
class DelayedOrder:
    id_order: int
    reference: str
    date_add: datetime
    days_passed: int
    id_state: int
    state_name: str
    dropshipping: bool
    status: Status
