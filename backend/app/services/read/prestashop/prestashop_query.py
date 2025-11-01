# app/services/read/prestashop_query.py

from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session

from app.helpers.formatters import _iso
from app.repos.prestashop.carts_read import CartsReadRepo
from app.repos.prestashop.payments_read import PaymentsReadRepo
from app.repos.prestashop.orders_read import OrdersReadRepo
from app.repos.prestashop.eol_read import EOLOutReadRepo
from app.repos.prestashop.pagespeed_read import PageSpeedReadRepo
from app.schemas.prestashop import PageSpeedDTO, AbandonedCartDTO

from app.schemas.prestashop import (
    PaymentMethodDTO,
    DelayedOrderDTO,
    EOLProductDTO,
)

class PrestashopQueryService:
    def __init__(self, db: Session):
        self._payments = PaymentsReadRepo(db)
        self._orders = OrdersReadRepo(db)
        self._eol = EOLOutReadRepo(db)
        self._pagespeed = PageSpeedReadRepo(db)
        self._carts = CartsReadRepo(db)

    # Payments
    def get_payments(self) -> List[PaymentMethodDTO]:
        rows = self._payments.latest_by_method()
        return [
            PaymentMethodDTO(
                method=r["method"],
                last_payment_at=_iso(r["last_payment_at"]),
                hours_since_last=float(r["hours_since_last"]),
                status=r["status"],
                observed_at=_iso(r["observed_at"]) or "",
            )
            for r in rows
        ]

    # Delayed Orders
    def get_delayed_orders(self) -> list[DelayedOrderDTO]:
        # troca latest_by_order() -> latest_by_run()
        rows = self._orders.latest_by_run(include_ok=False)
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


    # EOL Products
    def get_eol_products(self) -> list[EOLProductDTO]:
        rows = self._eol.latest_by_product()  # <--- usar o repo já criado
        return [
            EOLProductDTO(
                id_product=r["id_product"],
                name=r["name"],
                reference=r["reference"],
                ean13=r["ean13"],
                upc=r["upc"],
                price=float(r["price"]),
                last_in_stock_at=r["last_in_stock_at"].isoformat() if r["last_in_stock_at"] else None,
                days_since=int(r["days_since"]),
                status=r["status"],
                observed_at=r["observed_at"].isoformat(),
            )
            for r in rows
        ]

    def get_eol_counts(self) -> dict:
        return self._eol.counts()

    # PageSpeed (home + product)
    def get_pagespeed(self) -> list[PageSpeedDTO]:
        rows = self._pagespeed.latest_by_page_type()
        return [
            PageSpeedDTO(
                page_type=r["page_type"],
                url=r["url"],
                status=r["severity"],
                status_code=int(r["status_code"]),
                ttfb_ms=int(r["ttfb_ms"]),
                total_ms=int(r["total_ms"]),
                html_bytes=int(r["html_bytes"]),
                headers=r["headers"],
                sanity=r["sanity"],
                observed_at=r["observed_at"].isoformat(),
            )
            for r in rows
        ]

    # Abandoned Carts
    def get_abandoned_carts(self) -> list[AbandonedCartDTO]:
        rows = self._carts.latest()
        return [
            AbandonedCartDTO(
                id_cart=r["id_cart"],
                id_customer=r["id_customer"],
                items=r["items"],
                hours_stale=r["hours_stale"],
                status=r["status"],
                observed_at=r["observed_at"].isoformat(),
            )
            for r in rows
        ]