# workers/jobs/patife/healthz.py

def run(db_session_factory):
    from app.services.commands.patife.ingest_healthz import run as usecase_run
    return usecase_run(db_session_factory)
