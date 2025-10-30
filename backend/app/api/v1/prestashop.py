from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db  # garante que tens este helper
from app.core.deps import require_access_token
from app.services.read.prestashop_query import PrestashopQueryService
from app.schemas.prestashop import PageSpeedsListDTO, PaymentsListDTO, DelayedOrdersListDTO, EOLProductsListDTO, \
    AbandonedCartsListDTO

router = APIRouter(prefix="/prestashop", tags=["prestashop"])

@router.get("/payments", response_model=PaymentsListDTO)
def list_payments(db: Session = Depends(get_db), _=Depends(require_access_token)):
    svc = PrestashopQueryService(db)
    items = svc.get_payments()
    return {"ok": True, "count": len(items), "methods": items}


@router.get("/orders/delayed", response_model=DelayedOrdersListDTO)
def list_delayed_orders(db: Session = Depends(get_db), _=Depends(require_access_token)):
    svc = PrestashopQueryService(db)
    items = svc.get_delayed_orders()
    return {"ok": True, "count": len(items), "orders": items}


@router.get("/products/eol", response_model=EOLProductsListDTO)
def get_eol(db: Session = Depends(get_db), _=Depends(require_access_token)):
    svc = PrestashopQueryService(db)
    items = svc.get_eol_products()
    counts = svc.get_eol_counts()
    return {"ok": True, "count": len(items), "counts": counts, "items": items}

@router.get("/pagespeed", response_model=PageSpeedsListDTO)
def list_pagespeed(db: Session = Depends(get_db), _=Depends(require_access_token)):
    svc = PrestashopQueryService(db)
    items = svc.get_pagespeed()
    return {"ok": True, "count": len(items), "items": items}

@router.get("/carts/abandoned", response_model=AbandonedCartsListDTO)
def list_abandoned_carts(db: Session = Depends(get_db), _=Depends(require_access_token)):
    svc = PrestashopQueryService(db)
    items = svc.get_abandoned_carts()
    return {"ok": True, "count": len(items), "items": items}