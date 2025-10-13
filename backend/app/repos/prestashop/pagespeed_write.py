from sqlalchemy.orm import Session
from app.models.prestashop import PageSpeedSnapshot
from app.domains.prestashop.pagespeed.types import PageSpeed

class PageSpeedWriteRepo:
    def __init__(self, db: Session):
        self.db = db

    def insert_snapshot(self, item: PageSpeed, observed_at) -> None:
        row = PageSpeedSnapshot(
            page_type=item.page_type,
            url=item.url,
            status_code=item.status_code,
            severity=item.status.value,
            ttfb_ms=item.ttfb_ms,
            total_ms=item.total_ms,
            html_bytes=item.html_bytes,
            headers=item.headers,
            sanity=item.sanity,
            observed_at=observed_at,
        )
        self.db.add(row)
