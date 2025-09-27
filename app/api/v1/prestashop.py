from fastapi import APIRouter, Depends, HTTPException
from app.core.db import SessionLocal, Base, engine
from app.clients.prestashop_client import PrestashopClient
from app.services.prestashop_service import PrestashopService
from app.domain.prestashop.dto import PaymentsResponseDTO

router = APIRouter(prefix="/prestashop", tags=["prestashop"])

# garantir tabelas criadas (podes mover para startup)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/payments", response_model=PaymentsResponseDTO)
def get_payments(db=Depends(get_db)):
    try:
        service = PrestashopService(db=db, client=PrestashopClient())
        return service.get_payments_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Falha ao obter pagamentos: {e}")
