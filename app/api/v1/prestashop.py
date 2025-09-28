from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db  # garante que tens este helper
from app.services.read.prestashop_query import PrestashopQueryService
from app.schemas.prestashop import PaymentsListDTO

router = APIRouter(prefix="/prestashop", tags=["prestashop"])

@router.get("/payments", response_model=PaymentsListDTO)
def list_payments(db: Session = Depends(get_db)):
    svc = PrestashopQueryService(db)
    items = svc.get_payments()
    return {"ok": True, "count": len(items), "methods": items}
