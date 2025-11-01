from __future__ import annotations

from typing import Literal, List
from app.shared.status import Status
from app.schemas.alerts import (
    AlertItemDTO,
    PrestashopAlertsDTO,
    AlertsCountsDTO,
    GroupedAlertsDTO,
)
from app.services.read.prestashop.prestashop_query import PrestashopQueryService


def _sev_rank(s: str | Status) -> int:
    v = s.value if isinstance(s, Status) else str(s)
    return 0 if v == "critical" else (1 if v == "warning" else 2)


class AlertsQueryService:
    """
    Agrega alertas por domínio/kind.
    Por agora apenas 'prestashop'.
    """

    def __init__(self, db):
        self.ps = PrestashopQueryService(db)

    def list_grouped(
        self,
        min_status: Literal["warning", "critical"] = "warning",
    ) -> GroupedAlertsDTO:
        want_warning = (min_status == "warning")

        # --------- Prestashop: Payments ----------
        payments: List[AlertItemDTO] = []
        for m in self.ps.get_payments():
            if m.status not in ("warning", "critical"):
                continue
            if not want_warning and m.status != "critical":
                continue
            payments.append(
                AlertItemDTO(
                    key=m.method,
                    title=f"Método de pagamento '{m.method}' sem transações há {m.hours_since_last:.1f}h",
                    status=Status(m.status),
                    observed_at=m.observed_at,
                    payload={
                        "method": m.method,
                        "last_payment_at": m.last_payment_at,
                        "hours_since_last": m.hours_since_last,
                    },
                )
            )
        payments.sort(key=lambda a: (_sev_rank(a.status), a.observed_at))

        # --------- Prestashop: Delayed orders ----------
        delayed_orders: List[AlertItemDTO] = []
        for o in self.ps.get_delayed_orders():
            if o.status not in ("warning", "critical"):
                continue
            if not want_warning and o.status != "critical":
                continue
            drops = "dropshipping" if o.dropshipping else "normal"
            delayed_orders.append(
                AlertItemDTO(
                    key=o.reference or str(o.id_order),
                    title=f"Encomenda {o.reference} atrasada há {o.days_passed} dias ({drops}) — estado: {o.state_name}",
                    status=Status(o.status),
                    observed_at=o.observed_at,
                    payload={
                        "id_order": o.id_order,
                        "reference": o.reference,
                        "days_passed": o.days_passed,
                        "state": {"id": o.id_state, "name": o.state_name},
                        "dropshipping": o.dropshipping,
                        "date_add": o.date_add,
                    },
                )
            )
        delayed_orders.sort(key=lambda a: (_sev_rank(a.status), a.observed_at))

        # --------- Prestashop: EOL products ----------
        eol_products: List[AlertItemDTO] = []
        for p in self.ps.get_eol_products():
            if p.status not in ("warning", "critical"):
                continue
            if not want_warning and p.status != "critical":
                continue
            eol_products.append(
                AlertItemDTO(
                    key=str(p.id_product),
                    title=f"Produto EOL '{p.name}' sem stock há {p.days_since} dias",
                    status=Status(p.status),
                    observed_at=p.observed_at,
                    payload={
                        "id_product": p.id_product,
                        "name": p.name,
                        "reference": p.reference,
                        "price": p.price,
                        "last_in_stock_at": p.last_in_stock_at,
                        "days_since": p.days_since,
                        "ean13": p.ean13,
                        "upc": p.upc,
                    },
                )
            )
        eol_products.sort(key=lambda a: (_sev_rank(a.status), a.observed_at))

        counts = AlertsCountsDTO(
            payments=len(payments),
            delayed_orders=len(delayed_orders),
            eol_products=len(eol_products),
            total=len(payments) + len(delayed_orders) + len(eol_products),
        )

        return GroupedAlertsDTO(
            ok=True,
            counts=counts,
            prestashop=PrestashopAlertsDTO(
                payments=payments,
                delayed_orders=delayed_orders,
                eol_products=eol_products,
            ),
        )
