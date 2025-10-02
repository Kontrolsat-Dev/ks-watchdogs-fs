from __future__ import annotations
from sqlalchemy import Column, Integer, String, DateTime, Integer, JSON, Index
from sqlalchemy.sql import func
from app.core.db import Base

class CheckRun(Base):
    __tablename__ = "check_runs"

    id = Column(Integer, primary_key=True)
    check_name = Column(String, index=True)          # ex.: 'prestashop.payments'
    status = Column(String, index=True)              # 'ok' | 'error'
    duration_ms = Column(Integer)
    payload_json = Column(JSON, nullable=True)       # resumo opcional
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        Index("ix_check_runs_name_created", "check_name", "created_at"),
    )
