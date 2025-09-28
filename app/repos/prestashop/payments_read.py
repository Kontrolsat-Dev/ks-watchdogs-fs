from sqlalchemy import select, func, case, desc
from app.models.prestashop import PaymentMethodStatus as PMS

class PaymentsReadRepo:
    def __init__(self, db):
        self.db = db

    def latest_by_method(self) -> list[dict]:
        # subquery: último observed_at por método
        subq = (
            select(
                PMS.method.label("m"),
                func.max(PMS.observed_at).label("max_obs"),
            )
            .group_by(PMS.method)
            .subquery()
        )

        # CASE para ordenar severidade: critical (0), warning (1), ok (2)
        sev_case = case(
            (PMS.status == "critical", 0),
            (PMS.status == "warning", 1),
            else_=2,
        ).label("sev_rank")

        # join para obter a linha completa mais recente por método
        q = (
            select(PMS, sev_case)
            .join(subq, (PMS.method == subq.c.m) & (PMS.observed_at == subq.c.max_obs))
            .order_by(sev_case, desc(PMS.hours_since_last))
        )

        rows = self.db.execute(q).all()  # rows: list[Row(PMS, sev_rank)]
        out: list[dict] = []
        for row in rows:
            pms = row[0]  # PaymentMethodStatus
            out.append({
                "method": pms.method,
                "last_payment_at": pms.last_payment_at,
                "hours_since_last": pms.hours_since_last or 0.0,
                "status": pms.status,
                "observed_at": pms.observed_at,
            })
        return out
