import time, logging
from app.repos.shared.runs_write import RunsWriteRepo
from app.external.prestashop_client import PrestashopClient

CHECK_NAME = "prestashop.payments"
log = logging.getLogger("wd.jobs.prestashop")


def run(db_session_factory):
    db = db_session_factory()
    runs = RunsWriteRepo(db)
    t0 = time.perf_counter()
    status = ""
    payload = {}
    try:
        client = PrestashopClient()
        rows = client.fetch_payments()
        status = "ok"
        payload = {"count": len(rows)}
        log.info("%s fetched %d rows", CHECK_NAME, len(rows))
    except Exception as e:
        status = "error"
        payload = {"error": str(e)}
        log.exception("%s failed: %s", CHECK_NAME, e)
    finally:
        duration_ms = int((time.perf_counter() - t0) * 1000)
        run_id = runs.insert_run(CHECK_NAME, status, duration_ms, payload)
        db.close()
    return run_id
