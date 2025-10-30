# apps/worker_main.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from workers.scheduler import register_jobs
from app.core.db import SessionLocal
from app.core.logging import setup_logging
import logging, asyncio
from datetime import timezone

def main():
    setup_logging()
    log = logging.getLogger("wd.worker")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    # scheduler AsyncIO
    sched = AsyncIOScheduler(event_loop=loop)
    register_jobs(sched, SessionLocal)
    sched.start()

    log.info("worker started; scheduler running (every 10 min)")
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
