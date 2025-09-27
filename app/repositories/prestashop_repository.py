from datetime import datetime
from sqlalchemy.orm import Session
from app.models.Prestashop import PaymentSnapshot

class PrestashopRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_payment_snapshot(self, method: str, last_payment_at: datetime | None,
                              hours_since_last: float, status: str) -> PaymentSnapshot:
        row = PaymentSnapshot(
            method=method,
            last_payment_at=last_payment_at,
            hours_since_last=hours_since_last,
            status=status,
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def latest_by_method(self, method: str) -> PaymentSnapshot | None:
        return (
            self.db.query(PaymentSnapshot)
            .filter(PaymentSnapshot.method == method)
            .order_by(PaymentSnapshot.observed_at.desc())
            .first()
        )
