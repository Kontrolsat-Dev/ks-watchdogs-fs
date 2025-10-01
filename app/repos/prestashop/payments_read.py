from sqlalchemy import select, func, case, desc
from sqlalchemy.orm import Session
from app.models.prestashop import PaymentMethodStatus as PMS

class PaymentsReadRepo:
    def __init__(self, db: Session):
        self.db = db

    def latest_by_method(self) -> list[dict]:
        subq = (
            select(
                PMS.id.label("id"),
                PMS.method.label("method"),
                PMS.last_payment_at.label("last_payment_at"),
                PMS.hours_since_last.label("hours_since_last"),
                PMS.status.label("status"),
                PMS.observed_at.label("observed_at"),
                func.row_number()
                .over(
                    partition_by=PMS.method,
                    order_by=(desc(PMS.observed_at), desc(PMS.last_payment_at), desc(PMS.id)),
                )
                .label("rn"),
            )
        ).subquery("rn_per_method")

        latest = (
            select(
                subq.c.method,
                subq.c.last_payment_at,
                subq.c.hours_since_last,
                subq.c.status,
                subq.c.observed_at,
            )
            .where(subq.c.rn == 1)
        ).subquery("latest")

        sev_case = case(
            (latest.c.status == "critical", 0),
            (latest.c.status == "warning", 1),
            else_=2,
        ).label("sev_rank")

        q = (
            select(
                latest.c.method,
                latest.c.last_payment_at,
                latest.c.hours_since_last,
                latest.c.status,
                latest.c.observed_at,
                sev_case,  # opcional ter na projeção; ajuda a depurar/ordenar
            )
            .order_by(sev_case, desc(latest.c.hours_since_last))
        )

        rows = self.db.execute(q).all()
        out = []
        for method, last_payment_at, hours_since_last, status, observed_at, _sev in rows:
            out.append({
                "method": method,
                "last_payment_at": last_payment_at,
                "hours_since_last": hours_since_last or 0.0,
                "status": status,
                "observed_at": observed_at,
            })
        return out
