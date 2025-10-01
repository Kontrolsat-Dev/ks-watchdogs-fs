from datetime import datetime
from sqlalchemy.orm import Session
from app.models.prestashop import EOLProductSnapshot
from app.domains.prestashop.eol.types import EOLProduct
from app.shared.status import Status

def _status_str(s: Status | str) -> str:
    return s.value if isinstance(s, Status) else str(s)

class EOLOutWriteRepo:
    def __init__(self, db: Session): self.db = db

    def insert_snapshot(self, item: EOLProduct, observed_at: datetime) -> None:
        self.db.add(EOLProductSnapshot(
            product_id=item.id_product,
            name=item.name,
            reference=item.reference,
            ean13=item.ean13,
            upc=item.upc,
            price=item.price,
            last_in_stock_at=item.last_in_stock_at,
            days_since=item.days_since,
            status=_status_str(item.status),
            observed_at=observed_at,
        ))

    def insert_many(self, items: list[EOLProduct], observed_at: datetime) -> int:
        for it in items:
            self.insert_snapshot(it, observed_at)
        return len(items)
