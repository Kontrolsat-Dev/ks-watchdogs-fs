CHECK_NAME = "prestashop.pagespeed"

def run(db_session_factory):
    from app.services.commands.prestashop.ingest_pagespeed import run as usecase_run
    return usecase_run(db_session_factory)
