# app/api/v1/home.py
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.home import HomeSummaryOut
from app.services.queries.home.summary import HomeSummaryService

router = APIRouter(prefix="/home", tags=["Home"])

@router.get("/summary", response_model=HomeSummaryOut)
def home_summary(
    window: str = Query("24h"),
    sections: str | None = Query(None, description="exemplo: runs,kpis"),
    db: Session = Depends(get_db),
):
    svc = HomeSummaryService(db)
    return svc.build(window=window, sections=sections)
