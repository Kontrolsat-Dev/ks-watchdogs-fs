# app/services/prestashop_service.py
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.core.config import settings
from app.clients.prestashop_client import PrestashopClient
from app.core.timeutils import get_local_tz
from app.repositories.prestashop_repository import PrestashopRepository
from app.domain.prestashop import mappers
from app.domain.prestashop.dto import PaymentsResponseDTO

class PrestashopService:
    def __init__(self, db: Session, client: PrestashopClient):
        self.db = db
        self.client = client
        self.repo = PrestashopRepository(db)

    def get_payments_status(self) -> PaymentsResponseDTO:
        raw = self.client.get_payments_raw()
        data = raw.get("data") or []
        tz = get_local_tz(settings.TIMEZONE)
        now_dt = datetime.now(tz)

        domain_items = [mappers.raw_row_to_domain(row, now_dt) for row in data]

        for item in domain_items:
            self.repo.save_payment_snapshot(
                method=item.method,
                last_payment_at=item.last_payment_dt,
                hours_since_last=item.hours_since_last,
                status=item.status,
            )

        order = {"critical": 0, "warning": 1, "ok": 2}
        domain_items.sort(
            key=lambda x: (order[x.status], -(x.hours_since_last if x.hours_since_last != float("inf") else 10**9))
        )

        dto_items = [mappers.domain_to_dto(x) for x in domain_items]
        return PaymentsResponseDTO(ok=True, generated_at=now_dt.isoformat(), methods=dto_items)
