from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session

from app.repos.runs.read import RunsReadRepo
from app.schemas.runs import CheckRunDTO

def _iso(dt) -> str:
    return dt.isoformat() if dt else ""

class RunsQueryService:
    def __init__(self, db: Session):
        self.repo = RunsReadRepo(db)

    def list(
        self,
        limit: int = 100,
        status: Optional[str] = None,
        check_name: Optional[str] = None,
        since=None,
    ) -> List[CheckRunDTO]:
        rows = self.repo.list(limit=limit, status=status, check_name=check_name, since=since)
        return [
            CheckRunDTO(
                id=r["id"],
                check_name=r["check_name"],
                status=r["status"],
                duration_ms=int(r["duration_ms"] or 0),
                payload=r["payload"] or {},
                created_at=_iso(r["created_at"]),
            )
            for r in rows
        ]
