# repos/prestashop/eol_read.py
from sqlalchemy import select, func, desc, case
from sqlalchemy.orm import Session
from app.models.prestashop import EOLProductSnapshot as EPS

class EOLOutReadRepo:
    def __init__(self, db: Session):
        self.db = db

    def latest_by_product(self) -> list[dict]:
        subq = (
            select(
                EPS.product_id.label("pid"),
                func.max(EPS.observed_at).label("max_obs"),
            )
            .group_by(EPS.product_id)
            .subquery()
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

        out = []
        for row, _s in self.db.execute(q).all():
            out.append({
                "id_product": row.product_id,   # mantém a chave ‘id_product’ no DTO se preferes
                "name": row.name,
                "reference": row.reference,
                "ean13": row.ean13,
                "upc": row.upc,
                "price": float(row.price or 0),
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

    def latest_status_per_product_since(self, since_dt) -> list[str]:
        mx = (
            select(EPS.product_id.label("pid"), func.max(EPS.observed_at).label("last_seen"))
            .where(EPS.observed_at >= since_dt)
            .group_by(EPS.product_id)
            .subquery()
        )
        q = (
            select(EPS.status)
            .join(mx, (mx.c.pid == EPS.product_id) & (mx.c.last_seen == EPS.observed_at))
        )
        return [r[0] for r in self.db.execute(q).all()]

    def daily_counts_since(self, since_dt) -> list[dict]:
        day = func.date(EPS.observed_at)
        warn_cnt = func.sum(case((EPS.status == "warning", 1), else_=0)).label("warn_cnt")
        crit_cnt = func.sum(case((EPS.status == "critical", 1), else_=0)).label("crit_cnt")
        q = (
            select(day.label("d"), warn_cnt, crit_cnt)
            .where(EPS.observed_at >= since_dt)
            .group_by(day)
            .order_by(day)
        )
        rows = self.db.execute(q).all()
        return [
            {"ts": str(r.d), "warn": int(r.warn_cnt or 0), "critical": int(r.crit_cnt or 0)}
            for r in rows
        ]
