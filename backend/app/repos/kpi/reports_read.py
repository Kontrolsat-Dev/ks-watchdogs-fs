from sqlalchemy.orm import Session
from app.models.kpi import KPIReport

class KPIReportsReadRepo:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, report_id: str) -> KPIReport | None:
        return self.db.query(KPIReport).filter(KPIReport.report_id == report_id).first()
