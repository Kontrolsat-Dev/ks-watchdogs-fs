from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session

from app.repos.runs.read import RunsReadRepo
from app.schemas.runs import CheckRunDTO

def _iso(dt) -> str:
    return dt.isoformat() if dt else ""

def _coerce_run_status(s: Optional[str]) -> str:
    s = (s or "").lower().strip()
    if s == "ok":
        return "ok"
    if s == "error":
        return "error"
    # dados antigos como "warning" e "critical" significam run bem sucedida
    if s in {"warning", "critical"}:
        return "ok"
    # qualquer outra coisa inesperada tratamos como error para não mascarar bugs
    return "error"

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
            items.append(
                CheckRunDTO(
                    id=r["id"],
                    check_name=r["check_name"],
                    status=_coerce_run_status(r.get("status")),
                    duration_ms=int(r.get("duration_ms") or 0),
                    payload=(r.get("payload") or r.get("payload_json") or {}),
                    created_at=_iso(r.get("created_at")),
                )
            )
        return items
