# app/services/commands/prestashop/ingest_carts_stale.py
from time import perf_counter
from datetime import datetime
from zoneinfo import ZoneInfo
import logging
from app.external.prestashop_client import PrestashopClient
from app.domains.prestashop.carts.mappers import raw_to_domain
from app.repos.prestashop.carts_write import CartsWriteRepo
from app.repos.runs.write import RunsWriteRepo
from app.core.config import settings

CHECK_NAME = "prestashop.carts_stale"
log = logging.getLogger("wd.jobs.ps.carts_stale")

def run(db_session_factory):
    db = db_session_factory(); runs = RunsWriteRepo(db); repo = CartsWriteRepo(db)
    t0 = perf_counter()
    try:
        client = PrestashopClient()
        raw = client.fetch_carts_stale(
            hours=settings.PS_CART_STALE_WARN_H,
            limit=settings.PS_CART_STALE_LIMIT,
            max_days=settings.PS_CART_STALE_MAX_DAYS,
            min_items=settings.PS_CART_STALE_MIN_ITEMS,
        )
        items = [raw_to_domain(r) for r in raw]
        now = datetime.now(ZoneInfo(settings.TIMEZONE))
        repo.insert_many(items, observed_at=now); db.commit()
        dur = int((perf_counter() - t0) * 1000)
        order = {"ok": 0, "warning": 1, "critical": 2}
        worst = max((i.status.value for i in items), default="ok", key=lambda s: order[s])
        runs.insert_run(CHECK_NAME, "ok", dur, {"count": len(items), "worst": worst})
        log.info("%s wrote %d snapshots", CHECK_NAME, len(items))
        return True
    except Exception as e:
        db.rollback()
        runs.insert_run(CHECK_NAME, "error", int((perf_counter()-t0)*1000), {"error": repr(e)})
        log.exception("%s failed", CHECK_NAME)
        return False
    finally:
        db.close()
