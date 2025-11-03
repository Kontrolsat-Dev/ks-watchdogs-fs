# app/services/commands/patife/healthz.py

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo
from time import perf_counter
import logging

from app.core.config import settings
from app.external.patife_client import PatifeClient
from app.domains.tools.patife.mappers import raw_to_domain
from app.models.patife import PatifeHealthz
from app.repos.tools.patife_healthz_write import PatifeHealthzWriteRepo
from app.repos.runs.write import RunsWriteRepo

CHECK_NAME = "patife.ingest_healthz"
log = logging.getLogger("wd.jobs.patife.ingest_healthz")


def run(db_session_factory) -> bool:
    """
    Worker entrypoint — executa um ping ao /readyz do Patife, guarda snapshot e
    regista o CheckRun. Retorna True/False conforme sucesso geral da execução.
    """
    db = db_session_factory()
    runs = RunsWriteRepo(db)
    repo = PatifeHealthzWriteRepo(db)
    t0 = perf_counter()

    try:
        tz = ZoneInfo(settings.TIMEZONE)
        now_dt = datetime.now(tz)  # útil se precisares para logs/telemetria

        # 1) Chamada externa
        client = PatifeClient()
        payload = client.healthz()  # dict vindo do /api/readyz

        # 2) Mapear p/ domínio
        d = raw_to_domain(payload)

        # 3) Construir ORM row
        row = PatifeHealthz(
            status=d.status,
            is_online=d.is_online,
            time=d.time,  # timestamp reportado pelo Patife (já tz-aware no mapper)
            duration_ms=d.duration_ms or 0.0,

            db_ok=d.db_ok,
            db_latency_ms=d.db_latency_ms,
            db_error=d.db_error,

            cache_ok=d.cache_ok,
            cache_error=d.cache_error,

            disk_ok=d.disk_ok,
            disk_free_bytes=d.disk_free_bytes,
            disk_total_bytes=d.disk_total_bytes,
            disk_mount=d.disk_mount,
            disk_error=d.disk_error,

            php=d.php,
            sapi=d.sapi,
            env=d.env,
            app=d.app,

            payload_json=payload,  # auditoria
        )

        # 4) Persistir
        repo.insert_snapshot(row)
        db.commit()

        duration_ms = int((perf_counter() - t0) * 1000)

        # 5) Registar run (status: ok quando online; warning quando offline)
        run_status = "ok" if d.is_online else "warning"
        runs.insert_run(
            CHECK_NAME,
            run_status,
            duration_ms,
            {
                "is_online": d.is_online,
                "status": d.status,
                "snapshot_id": row.id,
                "reported_time": d.time.isoformat(),
                "duration_ms_healthz": d.duration_ms,
            },
        )
        db.commit()

        log.info(
            "Patife healthz snapshot saved id=%s online=%s status=%s (run %sms)",
            row.id, d.is_online, d.status, duration_ms
        )
        return True

    except Exception as e:
        db.rollback()
        duration_ms = int((perf_counter() - t0) * 1000)
        log.exception("Patife healthz worker failed")
        runs.insert_run(
            CHECK_NAME,
            "error",
            duration_ms,
            {"error": str(e)},
        )
        db.commit()
        return False

    finally:
        db.close()
