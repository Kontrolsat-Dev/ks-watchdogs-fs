from __future__ import annotations
from sqlalchemy import BigInteger, Boolean, Column, DateTime, Float, Integer, String, JSON, Index
from sqlalchemy.sql import func
from app.core.db import Base


class PatifeHealthz(Base):
    __tablename__ = "patife_healthz"

    id = Column(Integer, primary_key=True, autoincrement=True)

    status = Column(String(16), nullable=False)       # "ok"/"error"/...
    is_online = Column(Boolean, nullable=False)

    # timestamp do Patife
    time = Column(DateTime(timezone=True), nullable=False)
    duration_ms = Column(Float, nullable=True)

    # checks
    db_ok = Column(Boolean, nullable=True)
    db_latency_ms = Column(Float, nullable=True)
    db_error = Column(String(512), nullable=True)

    cache_ok = Column(Boolean, nullable=True)
    cache_error = Column(String(512), nullable=True)

    disk_ok = Column(Boolean, nullable=True)
    disk_free_bytes = Column(BigInteger, nullable=True)
    disk_total_bytes = Column(BigInteger, nullable=True)
    disk_mount = Column(String(255), nullable=True)
    disk_error = Column(String(512), nullable=True)

    # meta
    php = Column(String(32), nullable=True)
    sapi = Column(String(64), nullable=True)
    env = Column(String(64), nullable=True)
    app = Column(String(128), nullable=True)

    # payload bruto (para auditoria)
    payload_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_patife_healthz_time_desc", time.desc()),
        Index("ix_patife_healthz_online_time", is_online, time.desc()),
        Index("ix_patife_healthz_status_time", status, time.desc()),
        {"sqlite_autoincrement": True},
    )
