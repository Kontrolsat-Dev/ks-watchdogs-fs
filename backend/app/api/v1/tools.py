from fastapi import APIRouter, Depends, Query

from app.core.deps import require_access_token
from app.services.queries.tools.pda_query_service import PdaQueryService
from app.schemas.tools import Report
from app.schemas.common import Page

router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("/pda", response_model=Page[Report])
def list_pda_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    service = PdaQueryService()
    return service.get_pda_report(page=page, page_size=page_size)