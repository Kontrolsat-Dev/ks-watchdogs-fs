from __future__ import annotations
from datetime import datetime
from math import isfinite
from sqlalchemy.orm import Session

from app.models.prestashop import PaymentMethodStatus
from app.domains.prestashop.payments.types import PaymentMethod
from app.shared.status import Status  # Enum

def _status_str(s: Status | str) -> str:
    return s.value if isinstance(s, Status) else str(s)

def _finite_or_none(v: float | None) -> float | None:
    if v is None:
        return None
    return v if isfinite(v) else None  # evita 'inf' no SQLite

class PaymentsWriteRepo:
    def __init__(self, db: Session):
        self.db = db

    def insert_snapshot(self, item: PaymentMethod, observed_at: datetime) -> None:
        row = PaymentMethodStatus(
            method=item.method,
            last_payment_at=item.last_payment_at,
            hours_since_last=_finite_or_none(item.hours_since_last),
            status=_status_str(item.status),           # <-- guarda string
            observed_at=observed_at,
        )
        self.db.add(row)

    def insert_many(self, items: list[PaymentMethod], observed_at: datetime) -> int:
        rows = [
            PaymentMethodStatus(
                method=i.method,
                last_payment_at=i.last_payment_at,
                hours_since_last=_finite_or_none(i.hours_since_last),
                status=_status_str(i.status),          # <-- guarda string
                observed_at=observed_at,
            )
            for i in items
        ]
        self.db.add_all(rows)
        return len(rows)
