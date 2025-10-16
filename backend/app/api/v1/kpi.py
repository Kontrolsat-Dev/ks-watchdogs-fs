from fastapi import APIRouter, Query
from typing import Literal, Optional
from app.services.read.kpi_query import KPIQueryService
from app.schemas.kpi import EmployeeTimeseriesDTO, EmployeePerformanceDTO

router = APIRouter(prefix="/kpi", tags=["kpi"])

@router.get("/employees/timeseries", response_model=EmployeeTimeseriesDTO)
def employees_timeseries(
    role: Literal["prep", "invoice"] = Query(...),
    gran: Literal["day", "week", "month", "year"] = Query("day"),
    since: Optional[str] = None,
    until: Optional[str] = None,
):
    svc = KPIQueryService()
    res = svc.employees_timeseries(role=role, gran=gran, since=since, until=until)
    return {
        "ok": True,
        "role": res["role"],
        "gran": res["gran"],
        "since": res["since"],
        "until": res["until"],
        "count": len(res["series"]),
        "employees": res["series"],
    }

@router.get("/employees/performance", response_model=EmployeePerformanceDTO)
def employees_performance(
    role: Literal["prep", "invoice"] = Query(...),
    since: Optional[str] = Query(None, description="YYYY-MM-DD (inclusive)"),
    until: Optional[str] = Query(None, description="YYYY-MM-DD (exclusive)"),
    order_by: Literal["avg", "n", "min", "max"] = Query("avg"),
    order_dir: Literal["asc", "desc"] = Query("asc"),
    limit: int = Query(200, ge=1, le=5000),
):
    svc = KPIQueryService()
    res = svc.employees_performance(
        role=role,
        since=since,
        until=until,
        order_by=order_by,
        order_dir=order_dir,
        limit=limit,
    )
    return {
        "ok": True,
        "role": res["role"],
        "since": res["since"],
        "until": res["until"],
        "order_by": res["order_by"],
        "order_dir": res["order_dir"],
        "limit": res["limit"],
        "count": len(res["items"]),
        "items": res["items"],
    }
