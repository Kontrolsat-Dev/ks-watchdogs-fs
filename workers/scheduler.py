# workers/scheduler.py
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

log = logging.getLogger("workers.scheduler")

def register_jobs(sched: AsyncIOScheduler, db_session_factory):
    from workers.jobs.prestashop.prestashop_payments import run as ps_run

    sched.add_job(
        ps_run,
        "interval",
        seconds=20,  # << temporariamente baixo p/ testar; depois volta a minutes=5
        id="prestashop.payments",
        kwargs={"db_session_factory": db_session_factory},
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )
    log.info("scheduled job %s every %s", "prestashop.payments", "20s")
