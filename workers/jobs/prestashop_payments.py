CHECK_NAME = "prestashop.payments"

def run(db_session_factory):
    from app.services.commands.prestashop.ingest_payments import run as usecase_run
    return usecase_run(db_session_factory)
