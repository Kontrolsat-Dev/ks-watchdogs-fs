from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from app.shared.status import Status

@dataclass(slots=True)
class EOLProduct:
    id_product: int
    name: str
    reference: str
    ean13: str
    upc: str
    price: Decimal
    last_in_stock_at: datetime | None
    days_since: int
    status: Status
