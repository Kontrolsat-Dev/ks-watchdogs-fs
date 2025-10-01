def run(db_session_factory):
    from app.services.commands.prestashop.ingest_eol import run as usecase_run
    usecase_run(db_session_factory)