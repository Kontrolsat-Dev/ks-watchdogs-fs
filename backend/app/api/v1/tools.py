from fastapi import APIRouter, Depends

from app.core.deps import require_access_token
from app.services.queries.tools.pda import PdaClient

router = APIRouter(prefix="/tools", tags=["tools"])

@router.get("/pda")
def list_pda_logs(_ = Depends(require_access_token)):
    return PdaClient.fetch_reports()
