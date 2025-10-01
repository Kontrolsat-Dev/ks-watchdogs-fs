from __future__ import annotations
from sqlalchemy import Column, Integer, String, DateTime, Float, Index, Boolean, Numeric
from sqlalchemy.sql import func

from app.core.db import Base


class PaymentMethodStatus(Base):
    __tablename__ = "payment_method_status"

    id = Column(Integer, primary_key=True)
    method = Column(String, index=True)
    last_payment_at = Column(DateTime(timezone=True), nullable=True)
    hours_since_last = Column(Float)
    status = Column(String, index=True)
    observed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        Index("ix_pms_method_observed", "method", "observed_at"),
        Index("ix_pms_status_observed", "status", "observed_at"),
    )


class DelayedOrderSnapshot(Base):
    __tablename__ = "delayed_orders"

    id = Column(Integer, primary_key=True)
    id_order = Column(Integer, index=True)
    reference = Column(String)
    date_add = Column(DateTime(timezone=True))
    days_passed = Column(Integer)
    id_state = Column(Integer)
    state_name = Column(String)
    dropshipping = Column(Boolean, default=False)
    status = Column(String, index=True)  # ok|warning|critical
    observed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        Index("ix_do_order_observed", "id_order", "observed_at"),
        Index("ix_do_status_observed", "status", "observed_at"),
    )


class EOLProductSnapshot(Base):
    __tablename__ = "eol_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, index=True, nullable=False)
    name = Column(String(255), nullable=False, default="")
    reference = Column(String(64), nullable=False, default="")
    ean13 = Column(String(32), nullable=False, default="")
    upc = Column(String(32), nullable=False, default="")
    price = Column(Numeric(12, 4), nullable=False, default=0)
    last_in_stock_at = Column(DateTime(timezone=True), nullable=True)
    days_since = Column(Integer, nullable=False, default=0)
    status = Column(String(16), nullable=False)  # "ok" | "warning" | "critical"
    observed_at = Column(DateTime(timezone=True), nullable=False, index=True)
