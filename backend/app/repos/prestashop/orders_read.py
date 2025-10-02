from sqlalchemy import select, func, case, desc
from sqlalchemy.orm import Session
from app.models.prestashop import DelayedOrderSnapshot as DOS

class OrdersReadRepo:
    def __init__(self, db: Session): self.db = db

    def latest_by_order(self) -> list[dict]:
        subq = (select(DOS.id_order, func.max(DOS.observed_at).label("max_obs"))
                .group_by(DOS.id_order).subquery())
        sev = case((DOS.status=="critical",0),(DOS.status=="warning",1), else_=2).label("sev")
        q = (select(DOS, sev)
             .join(subq, (DOS.id_order==subq.c.id_order)&(DOS.observed_at==subq.c.max_obs))
             .order_by(sev, desc(DOS.days_passed)))
        rows = self.db.execute(q).all()
        out=[]
        for r in rows:
            o = r[0]
            out.append({
                "id_order": o.id_order,
                "reference": o.reference,
                "date_add": o.date_add,
                "days_passed": o.days_passed,
                "id_state": o.id_state,
                "state_name": o.state_name,
                "dropshipping": o.dropshipping,
                "status": o.status,
                "observed_at": o.observed_at,
            })
        return out
