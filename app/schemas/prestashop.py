from pydantic import BaseModel, ConfigDict
from typing import List
from app.shared.status import Status, StatusLiteral


# Payments
class PaymentMethodDTO(BaseModel):
    model_config = ConfigDict(use_enum_values=True)  # exporta "ok"/"warning"/"critical"
    method: str
    last_payment_at: str | None
    hours_since_last: float
    status: Status
    observed_at: str

class PaymentsListDTO(BaseModel):
    ok: bool
    count: int
    methods: List[PaymentMethodDTO]

# Delayed Orders
class DelayedOrderDTO(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    id_order: int
    reference: str
    date_add: str
    days_passed: int
    id_state: int
    state_name: str
    dropshipping: bool
    status: Status
    observed_at: str

class DelayedOrdersListDTO(BaseModel):
    ok: bool
    count: int
    orders: List[DelayedOrderDTO]

# EOL Products
class EOLProductDTO(BaseModel):
    id_product: int
    name: str
    reference: str
    ean13: str
    upc: str
    price: float
    last_in_stock_at: str | None
    days_since: int
    status: StatusLiteral
    observed_at: str

class EOLProductsListDTO(BaseModel):
    ok: bool
    count: int
    counts: dict
    items: List[EOLProductDTO]