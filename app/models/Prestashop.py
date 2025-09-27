from sqlalchemy import Column, String, DateTime, Float, Integer
from sqlalchemy.sql import func

from app.core.db import Base


class PaymentSnapshot(Base):
    __tablename__ = "payment_snapshot"

    id = Column(Integer, primary_key=True)
    method = Column(String, index=True)
    last_payment_at = Column(DateTime(timezone=True), index=True)
    hours_since_last = Column(Float)
    status = Column(String, index=True)  # ok / warning / critical
    observed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)