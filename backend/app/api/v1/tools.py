from fastapi import APIRouter, Depends, Query

from app.core.deps import require_access_token
from app.services.queries.tools.pda_query_service import PdaQueryService

router = APIRouter(prefix="/tools", tags=["tools"])

@router.get("/pda")
def list_pda_logs(
        _ = Depends(require_access_token),
        page: int = Query(1, ge=1),
        page_size: int = Query(50, ge=1, le=100),
    ):
    service = PdaQueryService()
    return service.get_pda_report()
