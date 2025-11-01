from __future__ import annotations
from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.services.queries.runs.runs import RunsQueryService
from app.schemas.runs import RunsListDTO

router = APIRouter(prefix="/runs", tags=["runs"])

@router.get("", response_model=RunsListDTO)
def list_runs(
    limit: int = Query(100, gt=0, le=1000),
    status: Literal["ok", "error", "all"] = Query("all"),
    check_name: Optional[str] = Query(None, description="ex: prestashop.payments"),
    db: Session = Depends(get_db),
):
    svc = RunsQueryService(db)
    st = None if status == "all" else status
    items = svc.list(limit=limit, status=st, check_name=check_name)
    return RunsListDTO(ok=True, count=len(items), runs=items)
