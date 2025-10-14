# workers/jobs/prestashop/prestashop_carts_stale.py
def run(db_session_factory):
    from app.services.commands.prestashop.ingest_carts_stale import run as usecase_run
    return usecase_run(db_session_factory)
