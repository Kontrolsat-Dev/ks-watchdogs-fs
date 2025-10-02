# app/repos/shared/write.py
from sqlalchemy.orm import Session
from app.models.runs import CheckRun

class RunsWriteRepo:
    def __init__(self, db: Session):
        self.db = db

    def insert_run(self, check_name: str, status: str, duration_ms: int, payload_json: dict | None) -> int:
        row = CheckRun(
            check_name=check_name,
            status=status,
            duration_ms=duration_ms,
            payload_json=payload_json or {},
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row.id
