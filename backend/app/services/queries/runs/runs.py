from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session

from app.repos.runs.read import RunsReadRepo
from app.schemas.runs import CheckRunDTO, CheckStatus

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
        items: List[CheckRunDTO] = []
        for r in rows:
            raw_status = r.get("status") or "error"
            try:
                st = CheckStatus(raw_status)
            except ValueError:
                st = CheckStatus.error
            items.append(
                CheckRunDTO(
                    id=r["id"],
                    check_name=r["check_name"],
                    status=st,
                    duration_ms=int(r.get("duration_ms") or 0),
                    payload=(r.get("payload") or r.get("payload_json") or {}),
                    created_at=_iso(r.get("created_at")),
                )
            )
        return items
