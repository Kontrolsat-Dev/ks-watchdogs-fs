from fastapi import APIRouter

router = APIRouter(prefix="/prestashop", tags=["prestashop"])

@router.get("/payments")
def get_payments():
    return {"message": "payments"}