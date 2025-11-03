# app/repos/kpi/patife_healthz_write.py

from __future__ import annotations
from sqlalchemy.orm import Session

from app.models.patife import PatifeHealthz


class PatifeHealthzWriteRepo:
    def __init__(self, db: Session):
        self.db = db

    def insert_snapshot(self, item: PatifeHealthz) -> PatifeHealthz:
        self.db.add(item)
        self.db.flush()
        return item
