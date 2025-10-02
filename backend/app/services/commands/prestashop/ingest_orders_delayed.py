# app/services/commands/prestashop/ingest_orders_delayed.py
from datetime import datetime
from zoneinfo import ZoneInfo
import time, logging

from app.core.config import settings
from app.external.prestashop_client import PrestashopClient
from app.repos.runs.write import RunsWriteRepo
from app.repos.prestashop.orders_write import OrdersWriteRepo
from app.domains.prestashop.orders.mappers import map_order_row_to_entity

CHECK_NAME = "prestashop.orders_delayed"
log = logging.getLogger("wd.jobs.ps.orders")

def run(db_session_factory):
    db = db_session_factory()
    runs = RunsWriteRepo(db)
    repo = OrdersWriteRepo(db)
    t0 = time.perf_counter()
    try:
        tz = ZoneInfo(settings.TIMEZONE)
        now_dt = datetime.now(tz)

        client = PrestashopClient()
        rows = client.fetch_delayed_orders()

        items = [
            map_order_row_to_entity(
                r, tz,
                settings.PS_ORDERS_WARN_DS_STD, settings.PS_ORDERS_CRIT_DS_STD,
                settings.PS_ORDERS_WARN_DS_DROPSHIP, settings.PS_ORDERS_CRIT_DS_DROPSHIP,
            )
            for r in rows
        ]

        for it in items:
            repo.insert_snapshot(it, observed_at=now_dt)
        db.commit()

        dur = int((time.perf_counter() - t0) * 1000)
        runs.insert_run(CHECK_NAME, "ok", dur, {"count": len(items)})
        log.info("%s wrote %d snapshots", CHECK_NAME, len(items))
        return True
    except Exception as e:
        db.rollback()
        dur = int((time.perf_counter() - t0) * 1000)
        runs.insert_run(CHECK_NAME, "error", dur, {"error": str(e)})
        log.exception("%s failed: %s", CHECK_NAME, e)
        return False
    finally:
        db.close()
