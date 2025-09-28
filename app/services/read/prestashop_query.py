from sqlalchemy.orm import Session
from app.repos.prestashop.payments_read import PaymentsReadRepo
from app.schemas.prestashop import PaymentMethodDTO

class PrestashopQueryService:
    def __init__(self, db: Session):
        self.repo = PaymentsReadRepo(db)

    def get_payments(self) -> list[PaymentMethodDTO]:
        rows = self.repo.latest_by_method()  # lista de dicts (stub)
        return [
            PaymentMethodDTO(
                method=r["method"],
                last_payment_at=r["last_payment_at"].isoformat() if r["last_payment_at"] else None,
                hours_since_last=float(r["hours_since_last"]),
                status=r["status"],
                observed_at=r["observed_at"].isoformat(),
            )
            for r in rows
        ]
