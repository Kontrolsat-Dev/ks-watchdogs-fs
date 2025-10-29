from sqlalchemy import select, func, case, desc
from sqlalchemy.orm import Session
from app.models.prestashop import DelayedOrderSnapshot as DOS

class OrdersReadRepo:
    def __init__(self, db: Session): self.db = db

    def latest_by_run(self, include_ok: bool = False) -> list[dict]:
        """
        Devolve TODOS os snapshots da run mais recente (mesmo observed_at).
        Por defeito exclui 'ok' (apenas atrasadas: warning|critical).
        """
        # max(observed_at) global = última run
        max_obs = select(func.max(DOS.observed_at)).scalar_subquery()

        sev = case(
            (DOS.status == "critical", 0),
            (DOS.status == "warning", 1),
            else_=2
        ).label("sev")

        q = (
            select(
                DOS.id_order,
                DOS.reference,
                DOS.date_add,
                DOS.days_passed,
                DOS.id_state,
                DOS.state_name,
                DOS.dropshipping,
                DOS.status,
                DOS.observed_at,
                sev,
            )
            .where(DOS.observed_at == max_obs)
        )

        if not include_ok:
            q = q.where(DOS.status.in_(["warning", "critical"]))

        q = q.order_by(sev, desc(DOS.days_passed))

        rows = self.db.execute(q).all()
        out = []
        for r in rows:
            # r é uma Row com colunas selecionadas acima
            out.append({
                "id_order": r.id_order,
                "reference": r.reference,
                "date_add": r.date_add,
                "days_passed": r.days_passed,
                "id_state": r.id_state,
                "state_name": r.state_name,
                "dropshipping": r.dropshipping,
                "status": r.status,
                "observed_at": r.observed_at,
            })
        return out

