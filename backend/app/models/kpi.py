from sqlalchemy import Column, String, Date, DateTime, Integer, Text, Index
from sqlalchemy.sql import func
from app.core.db import Base

class KPIReport(Base):
    __tablename__ = "kpi_reports"

    report_id = Column(String(64), primary_key=True)       # UUIDv5 string
    period = Column(String(16), nullable=False)             # day|week|month|year
    since = Column(Date, nullable=False)
    until = Column(Date, nullable=False)                   # exclusivo
    tz = Column(String(64), nullable=False)
    prompt_version = Column(Integer, nullable=False, default=1)
    model = Column(String(64), nullable=True)
    data_hash = Column(String(64), nullable=False)         # sha256 hex do payload
    report_text = Column(Text, nullable=False)
    token_input = Column(Integer, nullable=True)
    token_output = Column(Integer, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)

    __table_args__ = (
        Index("ix_kpi_reports_key", "period", "since", "until", "prompt_version"),
    )
