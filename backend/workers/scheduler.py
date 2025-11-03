# workers/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import timezone

TZ = timezone("Europe/Lisbon")


def register_jobs(sched: AsyncIOScheduler, db_session_factory):
    # Imports locais para evitar custo no import global
    from workers.jobs.prestashop.prestashop_payments import run as ps_payments_run
    from workers.jobs.prestashop.prestashop_orders_delayed import run as ps_orders_run
    from workers.jobs.prestashop.prestashop_eol import run as ps_eol_run
    from workers.jobs.prestashop.prestashop_pagespeed import run as ps_pagespeed_run
    from workers.jobs.prestashop.prestashop_carts_stale import run as ps_carts_run
    from workers.jobs.patife.healthz import run as pt_healthz_run

    common = dict(
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=300,   # 5 min de tolerância
        kwargs={"db_session_factory": db_session_factory},
    )

    sched.add_job(
        ps_payments_run,
        CronTrigger(minute="*/1", second=2, timezone=TZ),
        id="prestashop.payments",
        **common,
    )
    sched.add_job(
        ps_orders_run,
        CronTrigger(minute="*/1", second=6, timezone=TZ),
        id="prestashop.orders_delayed",
        **common,
    )
    sched.add_job(
        ps_eol_run,
        CronTrigger(minute="*/1", second=10, timezone=TZ),
        id="prestashop.eol_products",
        **common,
    )
    sched.add_job(
        ps_pagespeed_run,
        CronTrigger(minute="*/1", second=14, timezone=TZ),
        id="prestashop.pagespeed",
        **common,
    )
    sched.add_job(
        ps_carts_run,
        CronTrigger(minute="*/1", second=18, timezone=TZ),
        id="prestashop.carts_stale",
        **common,
    )

    # ---------- Tools ----------

    # Patife
    sched.add_job(
        pt_healthz_run,
        CronTrigger(minute="*/1", second=20, timezone=TZ),
        id="patife.healthz",
        **common
    )
