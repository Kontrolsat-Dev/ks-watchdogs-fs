# app/services/commands/prestashop/ingest_eol.py
from datetime import datetime
from zoneinfo import ZoneInfo
from time import perf_counter
import logging

from app.core.config import settings
from app.external.prestashop_client import PrestashopClient
from app.domains.prestashop.eol.mappers import raw_eol_row_to_entity
from app.repos.prestashop.eol_write import EOLOutWriteRepo
from app.repos.runs.write import RunsWriteRepo

CHECK_NAME = "prestashop.eol_products"
log = logging.getLogger("wd.jobs.ps.eol_products")

def run(db_session_factory):
    db = db_session_factory()
    runs = RunsWriteRepo(db)
    repo = EOLOutWriteRepo(db)
    t0 = perf_counter()
    try:
        tz = ZoneInfo(settings.TIMEZONE)
        now_dt = datetime.now(tz)

        client = PrestashopClient()
        rows = client.fetch_eol_products()

        # mapear e (por segurança) deduplicar por product_id mantendo o mais “recente” por last_in_stock_at
        by_id = {}
        for r in rows:
            ent = raw_eol_row_to_entity(r, tz, settings.PS_EOL_WARN_DAYS, settings.PS_EOL_CRIT_DAYS)
            cur = by_id.get(ent.id_product)
            def _ts(x): return x.last_in_stock_at or datetime.min.replace(tzinfo=tz)
            if cur is None or _ts(ent) >= _ts(cur):
                by_id[ent.id_product] = ent

        items = list(by_id.values())
        n = repo.insert_many(items, observed_at=now_dt)
        db.commit()
        order = {"ok": 0, "warning": 1, "critical": 2}
        worst = max((it.status.value for it in items), default="ok", key=lambda s: order[s])
        runs.insert_run(CHECK_NAME, "ok", int((perf_counter() - t0) * 1000),
                        {"count_raw": len(rows), "count_unique": n, "worst": worst})
        return True
    except Exception as e:
        db.rollback()
        runs.insert_run(CHECK_NAME, "error", int((perf_counter()-t0)*1000), {"error": str(e)})
        return False
    finally:
        db.close()
