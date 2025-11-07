from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import timezone

TZ = timezone("Europe/Lisbon")


def register_jobs(sched: AsyncIOScheduler, db_session_factory):
    # imports locais
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
        misfire_grace_time=300,
        kwargs={"db_session_factory": db_session_factory},
    )

    # Prestashop
    # pagamentos 1x hora em hh:02:02
    sched.add_job(
        ps_payments_run,
        CronTrigger(minute=2, second=2, timezone=TZ),
        id="prestashop.payments",
        **common,
    )
    # encomendas 1x hora em hh:06:06
    sched.add_job(
        ps_orders_run,
        CronTrigger(minute=6, second=6, timezone=TZ),
        id="prestashop.orders_delayed",
        **common,
    )
    # eol_produtos 1x por semana seg 04:10:10
    sched.add_job(
        ps_eol_run,
        CronTrigger(day_of_week="mon", hour=4, minute=10, second=10, timezone=TZ),
        id="prestashop.eol_products",
        **common,
    )
    # pagespeed 1x a cada 3h em hh:14:14
    sched.add_job(
        ps_pagespeed_run,
        CronTrigger(hour="*/3", minute=14, second=14, timezone=TZ),
        id="prestashop.pagespeed",
        **common,
    )
    # carrinhos 1x dia às 03:18:18
    sched.add_job(
        ps_carts_run,
        CronTrigger(hour=3, minute=18, second=18, timezone=TZ),
        id="prestashop.carts_stale",
        **common,
    )

    # Tools
    # patife 1x 30 min em mm múltiplos de 30 no segundo 20
    sched.add_job(
        pt_healthz_run,
        CronTrigger(minute="*/30", second=20, timezone=TZ),
        id="patife.healthz",
        **common,
    )
