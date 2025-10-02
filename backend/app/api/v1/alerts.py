from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Literal

from app.core.db import get_db
from app.schemas.alerts import GroupedAlertsDTO
from app.services.read.alerts_query import AlertsQueryService

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=GroupedAlertsDTO)
def list_grouped_alerts(
    min_status: Literal["warning", "critical"] = Query("warning"),
    db: Session = Depends(get_db),
):
    svc = AlertsQueryService(db)
    return svc.list_grouped(min_status=min_status)
