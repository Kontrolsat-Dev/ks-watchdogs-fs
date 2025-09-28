from __future__ import annotations
from sqlalchemy import Column, Integer, String, DateTime, Float, Index
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
