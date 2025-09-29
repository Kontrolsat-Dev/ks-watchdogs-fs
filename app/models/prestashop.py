from __future__ import annotations
from sqlalchemy import Column, Integer, String, DateTime, Float, Index, Boolean
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
    status = Column(String, index=True)           # ok|warning|critical
    observed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        Index("ix_do_order_observed", "id_order", "observed_at"),
        Index("ix_do_status_observed", "status", "observed_at"),
    )