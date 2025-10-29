from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Literal, Optional
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.services.read.kpi_query import KPIQueryService
from app.schemas.kpi import EmployeeTimeseriesDTO, EmployeePerformanceDTO, KPIReportOutDTO
from app.services.commands.kpi.report_generate import KPIReportGenerateService
from app.core.config import settings

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

@router.post("/reports/generate")
def generate_kpi_report(
    period: Literal["day", "week", "month", "year"] = Query("day"),
    since: Optional[str] = Query(None, description="YYYY-MM-DD (inclusive)"),
    until: Optional[str] = Query(None, description="YYYY-MM-DD (exclusive)"),
    force: bool = Query(False, description="Ignora cache e força novo report"),
):
    if not settings.N8N_REPORT_WEBHOOK_URL:
        raise HTTPException(status_code=500, detail="N8N webhook URL não configurada")

    svc = KPIReportGenerateService()
    res = svc.get_or_generate(period=period, since=since, until=until, force=force)

    # mapeamento 1:1 para a estrutura devolvida pelo service
    return {
        "ok": res["ok"],
        "report_id": res["uid"],                    # antes: res["report_id"]
        "period": res["meta"]["period"],
        "since": res["meta"]["since"],
        "until": res["meta"]["until"],
        "tz": res["meta"]["tz"],
        "n8n": {
            "url": res["n8n"]["url"],
            "status_code": res["n8n"]["status_code"],
            "error": res["n8n"]["error"],
            "response": res["n8n"]["response"],
        },
        "preview_sizes": res["preview_sizes"],
    }