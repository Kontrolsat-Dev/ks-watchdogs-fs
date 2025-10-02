from datetime import datetime
from sqlalchemy.orm import Session
from app.models.prestashop import DelayedOrderSnapshot
from app.domains.prestashop.orders.types import DelayedOrder
from app.shared.status import Status  # 👈

def _status_str(s: Status | str) -> str:
    return s.value if isinstance(s, Status) else str(s)

class OrdersWriteRepo:
    def __init__(self, db: Session):
        self.db = db

    def insert_snapshot(self, item: DelayedOrder, observed_at: datetime) -> None:
        self.db.add(DelayedOrderSnapshot(
            id_order=item.id_order,
            reference=item.reference,
            date_add=item.date_add,
            days_passed=item.days_passed,
            id_state=item.id_state,
            state_name=item.state_name,
            dropshipping=item.dropshipping,
            status=_status_str(item.status),
            observed_at=observed_at,
        ))
