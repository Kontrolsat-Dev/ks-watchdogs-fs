# app/domains/prestashop/carts/mappers.py
from .types import AbandonedCart
from .rules import classify_cart_stale
from app.core.config import settings

def raw_to_domain(row: dict) -> AbandonedCart:
    h = int(row.get("hours_stale") or 0)
    return AbandonedCart(
        id_cart=int(row["id_cart"]),
        id_customer=int(row.get("id_customer") or 0),
        hours_stale=h,
        items=int(row.get("items") or 0),
        status=classify_cart_stale(h, settings.PS_CART_STALE_WARN_H, settings.PS_CART_STALE_CRIT_H),
    )
