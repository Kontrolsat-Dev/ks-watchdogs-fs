from __future__ import annotations
from typing import List
from sqlalchemy.orm import Session

from app.repos.tools.patife_healthz_read import PatifeHealthzReadRepo
from app.schemas.tools import PatifeHealthzDTO
from app.schemas.common import Page, PageMeta


class PatifeQueryService:
    def __init__(self, db: Session):
        self.repo_r = PatifeHealthzReadRepo(db)

    def latest(self) -> PatifeHealthzDTO | None:
        r = self.repo_r.get_latest()
        if not r:
            return None

        return PatifeHealthzDTO(
            id=r.id,
            status=r.status,
            is_online=r.is_online,
            time=r.time.isoformat() if getattr(r, "time", None) else None,
            duration_ms=r.duration_ms,

            db_ok=r.db_ok,
            db_latency_ms=r.db_latency_ms,
            db_error=r.db_error,

            cache_ok=r.cache_ok,
            cache_error=r.cache_error,

            disk_ok=r.disk_ok,
            disk_free_bytes=r.disk_free_bytes,
            disk_total_bytes=r.disk_total_bytes,
            disk_mount=r.disk_mount,
            disk_error=r.disk_error,

            php=r.php,
            sapi=r.sapi,
            env=r.env,
            app=r.app,
        )

    def history(self, page: int, page_size: int) -> Page[PatifeHealthzDTO]:
        rows, total = self.repo_r.page(page, page_size)
        items = [
            PatifeHealthzDTO(
                id=r.id,
                status=r.status,
                is_online=r.is_online,
                time=r.time.isoformat() if getattr(r, "time", None) else None,
                duration_ms=r.duration_ms,

                db_ok=r.db_ok,
                db_latency_ms=r.db_latency_ms,
                db_error=r.db_error,

                cache_ok=r.cache_ok,
                cache_error=r.cache_error,

                disk_ok=r.disk_ok,
                disk_free_bytes=r.disk_free_bytes,
                disk_total_bytes=r.disk_total_bytes,
                disk_mount=r.disk_mount,
                disk_error=r.disk_error,

                php=r.php,
                sapi=r.sapi,
                env=r.env,
                app=r.app,
            )
            for r in rows
        ]

        has_next = (page * page_size) < total
        has_prev = page > 1

        return Page[
            PatifeHealthzDTO
        ](
            items=items,
            meta=PageMeta(
                page=page,
                page_size=page_size,
                total=total,
                has_next=has_next,
                has_prev=has_prev,
            ),
        )
