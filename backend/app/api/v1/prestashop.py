from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db  # garante que tens este helper
from app.services.read.prestashop_query import PrestashopQueryService
from app.schemas.prestashop import PaymentsListDTO, DelayedOrdersListDTO, EOLProductsListDTO

router = APIRouter(prefix="/prestashop", tags=["prestashop"])

@router.get("/payments", response_model=PaymentsListDTO)
def list_payments(db: Session = Depends(get_db)):
    svc = PrestashopQueryService(db)
    items = svc.get_payments()
    return {"ok": True, "count": len(items), "methods": items}


@router.get("/orders/delayed", response_model=DelayedOrdersListDTO)
def list_delayed_orders(db: Session = Depends(get_db)):
    svc = PrestashopQueryService(db)
    items = svc.get_delayed_orders()
    return {"ok": True, "count": len(items), "orders": items}


@router.get("/products/eol", response_model=EOLProductsListDTO)
def get_eol(db: Session = Depends(get_db)):
    svc = PrestashopQueryService(db)
    items = svc.get_eol_products()
    counts = svc.get_eol_counts()
    return {"ok": True, "count": len(items), "counts": counts, "items": items}