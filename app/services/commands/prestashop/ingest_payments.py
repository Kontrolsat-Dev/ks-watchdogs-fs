from datetime import datetime

from app.domains.prestashop.payments.types import PaymentMethod
from app.repos.shared.runs_write import RunsWriteRepo
from app.repos.prestashop.payments_write import PaymentsWriteRepo
from app.external.prestashop_client import PrestashopClient
from app.domains.prestashop.payments.mappers import raw_row_to_domain
from app.core.config import settings

import logging
from zoneinfo import ZoneInfo
from time import perf_counter

CHECK_NAME = "prestashop.payments"
log = logging.getLogger("wd.jobs.ps.payments")
EPOCH = datetime(1970, 1, 1, tzinfo=ZoneInfo(settings.TIMEZONE))

def run(db_session_factory):
    db = db_session_factory()
    runs = RunsWriteRepo(db)
    repo = PaymentsWriteRepo(db)
    t0 = perf_counter()

    try:
        client = PrestashopClient()
        rows = client.fetch_payments()

        tz = ZoneInfo(settings.TIMEZONE)
        now_dt = datetime.now(tz)

        items = [
            raw_row_to_domain(
                row, now_dt, tz,
                settings.PS_PAYMENTS_WARNING_HOURS,
                settings.PS_PAYMENTS_CRITICAL_HOURS,
            )
            for row in rows
        ]

        dedup: dict[str, PaymentMethod] = {}
        for it in items:
            prev = dedup.get(it.method)
            it_dt  = it.last_payment_at or EPOCH
            prev_dt = (prev.last_payment_at if prev else None) or EPOCH
            if (prev is None) or (it_dt > prev_dt):
                dedup[it.method] = it

        uniq = list(dedup.values())

        # grava só 1 por método
        for it in uniq:
            repo.insert_snapshot(it, observed_at=now_dt)
        db.commit()

        duration_ms = int((perf_counter() - t0) * 1000)
        runs.insert_run(
            CHECK_NAME, "ok", duration_ms,
            {"count_raw": len(items), "count_unique": len(uniq)}
        )
        log.info("%s wrote %d snapshots", CHECK_NAME, len(items))
        return True

    except Exception as e:
        db.rollback()
        duration_ms = int((perf_counter() - t0) * 1000)
        runs.insert_run(CHECK_NAME, "error", duration_ms, {"error": str(e)})
        return False

    finally:
        db.close()
