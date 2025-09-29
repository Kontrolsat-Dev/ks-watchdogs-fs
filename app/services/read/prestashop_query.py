from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.helpers.formatters import _iso
from app.repos.prestashop.payments_read import PaymentsReadRepo
from app.repos.prestashop.orders_read import OrdersReadRepo  # <-- novo

from app.schemas.prestashop import (
    PaymentMethodDTO,
    DelayedOrderDTO,            # <-- garante que está definido nos schemas
)


class PrestashopQueryService:
    def __init__(self, db: Session):
        self._payments = PaymentsReadRepo(db)
        self._orders   = OrdersReadRepo(db)  # <-- novo

    # Pagamentos
    def get_payments(self) -> List[PaymentMethodDTO]:
        rows = self._payments.latest_by_method()
        return [
            PaymentMethodDTO(
                method=r["method"],
                last_payment_at=_iso(r["last_payment_at"]),
                hours_since_last=float(r["hours_since_last"]),
                status=r["status"],
                observed_at=_iso(r["observed_at"]) or "",  # nunca deve faltar
            )
            for r in rows
        ]

    # Encomendas atrasadas
    def get_delayed_orders(self) -> list[DelayedOrderDTO]:
        rows = self._orders.latest_by_order()  # lista de dicts do repo
        return [
            DelayedOrderDTO(
                id_order=int(r["id_order"]),
                reference=str(r["reference"] or ""),
                date_add=(r["date_add"].isoformat() if r["date_add"] else ""),
                days_passed=int(r["days_passed"]),
                id_state=int(r["id_state"]),
                state_name=str(r["state_name"] or ""),
                dropshipping=bool(r["dropshipping"]),
                status=r["status"],
                observed_at=r["observed_at"].isoformat(),
            )
            for r in rows
        ]

