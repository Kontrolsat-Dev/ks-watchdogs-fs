from sqlalchemy import select, func, desc, case
from sqlalchemy.orm import Session
from app.models.prestashop import EOLProductSnapshot as EPS

class EOLOutReadRepo:
    def __init__(self, db: Session): self.db = db

    def latest_by_product(self) -> list[dict]:
        subq = (
            select(
                EPS.product_id.label("pid"),
                func.max(EPS.observed_at).label("max_obs"),
            ).group_by(EPS.product_id).subquery()
        )

        sev = case(
            (EPS.status == "critical", 0),
            (EPS.status == "warning", 1),
            else_=2,
        ).label("sev")

        q = (
            select(EPS, sev)
            .join(subq, (EPS.product_id == subq.c.pid) & (EPS.observed_at == subq.c.max_obs))
            .order_by(sev, desc(EPS.days_since), desc(EPS.price))
        )

        out=[]
        for row, _s in self.db.execute(q).all():
            out.append({
                "id_product": row.product_id,
                "name": row.name,
                "reference": row.reference,
                "ean13": row.ean13,
                "upc": row.upc,
                "price": float(row.price or 0),  # para JSON
                "last_in_stock_at": row.last_in_stock_at,
                "days_since": row.days_since,
                "status": row.status,
                "observed_at": row.observed_at,
            })
        return out

    def counts(self) -> dict:
        q = select(EPS.status, func.count()).group_by(EPS.status)
        by = {k: v for k, v in self.db.execute(q).all()}
        total = sum(by.values())
        return {
            "warning": int(by.get("warning", 0)),
            "critical": int(by.get("critical", 0)),
            "ok": int(by.get("ok", 0)),
            "total": int(total),
        }
