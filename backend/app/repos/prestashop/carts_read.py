# app/repos/prestashop/carts_read.py
from sqlalchemy.orm import Session
from sqlalchemy import func, select

from app.models.prestashop import AbandonedCartSnapshot

def _row(r: AbandonedCartSnapshot) -> dict:
    return {
        "id_cart": r.id_cart,
        "id_customer": r.id_customer,
        "items": r.items,
        "hours_stale": r.hours_stale,
        "status": r.status,
        "observed_at": r.observed_at,
    }

class CartsReadRepo:
    def __init__(self, db: Session): self.db = db

    def latest(self) -> list[dict]:
        ts = self.db.query(func.max(AbandonedCartSnapshot.observed_at)).scalar()
        if not ts:
            return []
        q = (self.db.query(AbandonedCartSnapshot)
             .where(AbandonedCartSnapshot.observed_at == ts)
             .order_by(AbandonedCartSnapshot.hours_stale.desc(),
                       AbandonedCartSnapshot.id_cart.desc()))
        return [_row(r) for r in q.all()]

    def distinct_count_since(self, since_dt) -> int:
        q = select(func.count(func.distinct(AbandonedCartSnapshot.id_cart))).where(AbandonedCartSnapshot.observed_at >= since_dt)
        return int(self.db.execute(q).scalar() or 0)

    def daily_series_since(self, since_dt) -> list[dict]:
        day = func.date(AbandonedCartSnapshot.observed_at)
        q = (
            select(day.label("d"), func.count(func.distinct(AbandonedCartSnapshot.id_cart)).label("cnt"))
            .where(AbandonedCartSnapshot.observed_at >= since_dt)
            .group_by(day)
            .order_by(day)
        )
        rows = self.db.execute(q).all()
        return [{"ts": str(r.d), "count": int(r.cnt)} for r in rows]