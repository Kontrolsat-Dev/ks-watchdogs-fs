from __future__ import annotations
from typing import Optional, List, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
import json

from app.models.runs import CheckRun

class RunsReadRepo:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        limit: int = 100,
        status: Optional[str] = None,      # "ok" | "error" | None
        check_name: Optional[str] = None,  # ex: "prestashop.payments"
        since: Optional[object] = None,    # datetime | None
    ) -> List[Dict[str, Any]]:
        c = CheckRun
        order_col = getattr(c, "created_at", c.id)

        q = select(c).order_by(desc(order_col)).limit(limit)
        if status in ("ok", "error"):
            q = q.where(c.status == status)
        if check_name:
            q = q.where(c.check_name == check_name)
        if since and hasattr(c, "created_at"):
            q = q.where(c.created_at >= since)

        rows = self.db.execute(q).scalars().all()
        out: List[Dict[str, Any]] = []
        for r in rows:
            payload = getattr(r, "payload_json", {}) or {}
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except Exception:
                    payload = {"raw": payload}
            out.append({
                "id": r.id,
                "check_name": r.check_name,
                "status": r.status,
                "duration_ms": r.duration_ms,
                "payload": payload,
                "created_at": getattr(r, "created_at", None),
            })
        return out
