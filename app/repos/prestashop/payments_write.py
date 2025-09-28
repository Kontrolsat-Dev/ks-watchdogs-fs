from datetime import datetime
from sqlalchemy.orm import Session
from app.models.prestashop import PaymentMethodStatus
from app.domains.prestashop.payments.types import PaymentMethod

class PaymentsWriteRepo:
    def __init__(self, db: Session):
        self.db = db

    def insert_snapshot(self, item: PaymentMethod, observed_at: datetime) -> None:
        row = PaymentMethodStatus(
            method=item.method,
            last_payment_at=item.last_payment_at,
            hours_since_last=item.hours_since_last,
            status=item.status,
            observed_at=observed_at,
        )
        self.db.add(row)

    # opcional: batch helper
    def insert_many(self, items: list[PaymentMethod], observed_at: datetime) -> int:
        rows = [
            PaymentMethodStatus(
                method=i.method,
                last_payment_at=i.last_payment_at,
                hours_since_last=i.hours_since_last,
                status=i.status,
                observed_at=observed_at,
            )
            for i in items
        ]
        self.db.add_all(rows)
        return len(rows)
