# app/repos/tools/patife_healthz_read.py
# Repositório de leitura para o modelo PatifeHealthz.

from __future__ import annotations
import datetime
from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, select, desc

from app.models.patife import PatifeHealthz


class PatifeHealthzReadRepo:
    def __init__(self, db: Session):
        self.db = db

    def get_latest(self) -> PatifeHealthz | None:
        stmt = select(PatifeHealthz).order_by(
            desc(PatifeHealthz.time)).limit(1)
        return self.db.execute(stmt).scalars().first()

    def page(self, page: int, page_size: int) -> Tuple[List[PatifeHealthz], int]:
        stmt = select(PatifeHealthz).order_by(desc(PatifeHealthz.time))
        total = self.db.execute(
            select(func.count()).select_from(PatifeHealthz)).scalar_one()
        rows = self.db.execute(stmt.offset(
            (page - 1) * page_size).limit(page_size)).scalars().all()
        return rows, total
