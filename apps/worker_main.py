# apps/worker_main.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from workers.scheduler import register_jobs
from app.core.db import SessionLocal
from app.core.logging import setup_logging  # <<

import logging

def main():
    setup_logging()  # << habilita console + ficheiro
    log = logging.getLogger("worker")

    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    sched = AsyncIOScheduler(event_loop=loop)
    register_jobs(sched, SessionLocal)
    sched.start()

    log.info("worker started; scheduler running")
    try:
        loop.run_forever()
    except KeyboardInterrupt:
        log.info("worker stopping (KeyboardInterrupt)")
    finally:
        try:
            sched.shutdown(wait=False)
        except Exception:
            pass
        loop.stop()
        loop.close()

if __name__ == "__main__":
    main()
