# workers/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta

def register_jobs(sched: AsyncIOScheduler, db_session_factory):
    from workers.jobs.prestashop.prestashop_payments import run as ps_payments_run
    from workers.jobs.prestashop.prestashop_orders_delayed import run as ps_orders_run
    from workers.jobs.prestashop.prestashop_eol import run as ps_eol_run

    # Pagamentos
    sched.add_job(
        ps_payments_run, "interval",
        minutes=1, next_run_time=datetime.now() + timedelta(seconds=2),
        id="prestashop.payments",
        kwargs={"db_session_factory": db_session_factory},
        max_instances=1, coalesce=True, replace_existing=True,
    )

    # Encomendas atrasadas
    sched.add_job(
        ps_orders_run, "interval",
        minutes=5, next_run_time=datetime.now() + timedelta(seconds=5),
        id="prestashop.orders_delayed",
        kwargs={"db_session_factory": db_session_factory},
        max_instances=1, coalesce=True, replace_existing=True,
    )

    sched.add_job(
        ps_eol_run, "interval",
        minutes=5, next_run_time=datetime.now() + timedelta(seconds=5),
        id="prestashop.eol_products",
        kwargs={"db_session_factory": db_session_factory},
        max_instances=1, coalesce=True, replace_existing=True,
    )
