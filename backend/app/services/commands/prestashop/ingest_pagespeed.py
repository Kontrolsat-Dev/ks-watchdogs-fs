from time import perf_counter
from datetime import datetime
from zoneinfo import ZoneInfo
import logging

from app.external.prestashop_client import PrestashopClient
from app.domains.prestashop.pagespeed.mappers import raw_to_domain
from app.repos.prestashop.pagespeed_write import PageSpeedWriteRepo
from app.repos.runs.write import RunsWriteRepo
from app.core.config import settings

CHECK_NAME = "prestashop.pagespeed"
log = logging.getLogger("wd.jobs.ps.pagespeed")

def run(db_session_factory):
    db = db_session_factory()
    runs = RunsWriteRepo(db)
    repo = PageSpeedWriteRepo(db)
    t0 = perf_counter()
    try:
        client = PrestashopClient()
        results_raw = [client.fetch_pagespeed("home"), client.fetch_pagespeed("product")]

        items = [
            raw_to_domain(
                page_type=r["page_type"],
                url=r["url"],
                status_code=r["status_code"],
                ttfb_ms=r["ttfb_ms"],
                total_ms=r["total_ms"],
                html_bytes=r["html_bytes"],
                headers=r["headers"],
                html_text=r["html_text"],
            )
            for r in results_raw
        ]

        now_dt = datetime.now(ZoneInfo(settings.TIMEZONE))
        for it in items:
            repo.insert_snapshot(it, observed_at=now_dt)
        db.commit()

        dur_ms = int((perf_counter() - t0) * 1000)
        worst = max(items, key=lambda x: {"ok":0,"warning":1,"critical":2}[x.status.value]).status.value
        runs.insert_run(
            CHECK_NAME, worst, dur_ms,
            {"home": items[0].ttfb_ms, "product": items[1].ttfb_ms}
        )
        log.info("%s wrote %d snapshots", CHECK_NAME, len(items))
        return True
    except Exception as e:
        db.rollback()
        dur_ms = int((perf_counter() - t0) * 1000)
        runs.insert_run(CHECK_NAME, "error", dur_ms, {"error": repr(e)})
        log.exception("%s failed", CHECK_NAME)   # <— isto imprime stacktrace
        return False
    finally:
        db.close()
