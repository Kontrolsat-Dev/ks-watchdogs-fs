from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_access_token
from app.services.queries.tools.patife_query_service import PatifeQueryService
from app.services.queries.tools.pda_query_service import PdaQueryService
from app.schemas.tools import PatifeHealthzDTO, Report
from app.schemas.common import Page


router = APIRouter(prefix="/tools", tags=["tools"])

# PDA ---------

@router.get("/pda", response_model=Page[Report])
def list_pda_logs(
    _=Depends(require_access_token),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    service = PdaQueryService()
    return service.get_pda_report(page=page, page_size=page_size)


# Patife ---------

@router.get("/patife/healthz/latest", response_model=PatifeHealthzDTO)
def patife_latest(_: str = Depends(require_access_token), db: Session = Depends(get_db)):
    qs = PatifeQueryService(db)
    return qs.latest()


@router.get("/patife/healthz/history", response_model=Page[PatifeHealthzDTO])
def patife_history(
    _: str = Depends(require_access_token),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    qs = PatifeQueryService(db)
    return qs.history(page=page, page_size=page_size)
