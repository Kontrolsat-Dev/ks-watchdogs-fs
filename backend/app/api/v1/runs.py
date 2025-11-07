from enum import Enum
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.services.queries.runs.runs import RunsQueryService
from app.schemas.runs import RunsListDTO

router = APIRouter()

class RunsStatusFilter(str, Enum):
    all = "all"
    ok = "ok"
    error = "error"
    critical = "critical"
    warning = "warning"

@router.get("", response_model=RunsListDTO)
def list_runs(
    limit: int = Query(100, gt=0, le=1000),
    status: RunsStatusFilter = Query(RunsStatusFilter.all),
    check_name: Optional[str] = Query(None, description="ex: prestashop.payments"),
    db: Session = Depends(get_db),
):
    svc = RunsQueryService(db)
    st: Optional[str] = None if status is RunsStatusFilter.all else status.value
    items = svc.list(limit=limit, status=st, check_name=check_name)
    return RunsListDTO(ok=True, count=len(items), runs=items)
