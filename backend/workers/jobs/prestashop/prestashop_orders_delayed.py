def run(db_session_factory):
    from app.services.commands.prestashop.ingest_orders_delayed import run as usecase_run
    return usecase_run(db_session_factory)
