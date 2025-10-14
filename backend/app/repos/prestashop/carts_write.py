# app/repos/prestashop/carts_write.py
from sqlalchemy.orm import Session
from app.models.prestashop import AbandonedCartSnapshot
from app.domains.prestashop.carts.types import AbandonedCart

class CartsWriteRepo:
    def __init__(self, db: Session): self.db = db
    def insert_many(self, items: list[AbandonedCart], observed_at):
        rows = [AbandonedCartSnapshot(
            id_cart=i.id_cart, id_customer=i.id_customer, items=i.items,
            hours_stale=i.hours_stale, status=i.status.value, observed_at=observed_at
        ) for i in items]
        self.db.add_all(rows); return len(rows)
