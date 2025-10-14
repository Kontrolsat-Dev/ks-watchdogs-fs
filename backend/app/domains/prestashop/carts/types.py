# app/domains/prestashop/carts/types.py
from dataclasses import dataclass
from app.shared.status import Status

@dataclass(slots=True)
class AbandonedCart:
    id_cart: int
    id_customer: int
    hours_stale: int
    items: int
    status: Status
