from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.models.prestashop import PageSpeedSnapshot

class PageSpeedReadRepo:
    def __init__(self, db: Session):
        self.db = db

    def latest_by_page_type(self) -> list[dict]:
        sub = (
            select(
                PageSpeedSnapshot.page_type,
                func.max(PageSpeedSnapshot.observed_at).label("max_obs"),
            )
            .group_by(PageSpeedSnapshot.page_type)
            .subquery()
        )
        q = (
            self.db.query(PageSpeedSnapshot)
            .join(sub, (PageSpeedSnapshot.page_type == sub.c.page_type) & (PageSpeedSnapshot.observed_at == sub.c.max_obs))
            .order_by(PageSpeedSnapshot.page_type.asc())
        )
        rows = []
        for r in q.all():
            rows.append({
                "page_type": r.page_type,
                "url": r.url,
                "status_code": r.status_code,
                "severity": r.severity,
                "ttfb_ms": r.ttfb_ms,
                "total_ms": r.total_ms,
                "html_bytes": r.html_bytes,
                "headers": r.headers,
                "sanity": r.sanity,
                "observed_at": r.observed_at,
            })
        return rows
