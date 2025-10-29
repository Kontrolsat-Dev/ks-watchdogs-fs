from sqlalchemy.orm import Session
from app.models.kpi import KPIReport

class KPIReportsWriteRepo:
    def __init__(self, db: Session):
        self.db = db

    def upsert(self, obj: KPIReport) -> KPIReport:
        return self.db.merge(obj)
