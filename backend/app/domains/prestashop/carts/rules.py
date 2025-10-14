# app/domains/prestashop/carts/rules.py
from app.shared.status import Status

def classify_cart_stale(hours: int, warn_h: int, crit_h: int) -> Status:
    if hours >= crit_h: return Status.CRITICAL
    if hours >= warn_h: return Status.WARNING
    return Status.OK
