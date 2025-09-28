from datetime import datetime
from app.repos.shared.runs_write import RunsWriteRepo
from app.repos.prestashop.payments_write import PaymentsWriteRepo
from app.external.prestashop_client import PrestashopClient
from app.domains.prestashop.payments.mappers import raw_row_to_domain
from app.core.config import settings
from zoneinfo import ZoneInfo

CHECK_NAME = "prestashop.payments"

def run(db_session_factory):
    db = db_session_factory()
    runs = RunsWriteRepo(db)
    repo = PaymentsWriteRepo(db)
    t0_ms = datetime.now()

    try:
        client = PrestashopClient()
        rows = client.fetch_payments()

        tz = ZoneInfo(settings.TIMEZONE)
        now_dt = datetime.now(tz)

        items = [
            raw_row_to_domain(
                row,
                now_dt,
                tz,
                settings.PS_PAYMENTS_WARNING_HOURS,
                settings.PS_PAYMENTS_CRITICAL_HOURS,
            )
            for row in rows
        ]

        # escreve snapshots (um commit no fim)
        for it in items:
            repo.insert_snapshot(it, observed_at=now_dt)

        db.commit()

        duration_ms = int((datetime.now() - t0_ms).total_seconds() * 1000)
        runs.insert_run(CHECK_NAME, "ok", duration_ms, {"count": len(items)})
        return True

    except Exception as e:
        db.rollback()
        duration_ms = int((datetime.now() - t0_ms).total_seconds() * 1000)
        runs.insert_run(CHECK_NAME, "error", duration_ms, {"error": str(e)})
        return False

    finally:
        db.close()
