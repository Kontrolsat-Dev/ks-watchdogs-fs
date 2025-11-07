# repos/prestashop/pagespeed_read.py
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.prestashop import PageSpeedSnapshot as PSS

class PageSpeedReadRepo:
    def __init__(self, db: Session):
        self.db = db
        # deteção dinâmica das colunas disponíveis
        self._has_status = hasattr(PSS, "status")
        self._has_severity = hasattr(PSS, "severity")
        self._has_status_code = hasattr(PSS, "status_code")

    def latest_by_page_type(self) -> list[dict]:
        sub = (
            select(PSS.page_type, func.max(PSS.observed_at).label("max_obs"))
            .group_by(PSS.page_type)
            .subquery()
        )
        q = (
            self.db.query(PSS)
            .join(sub, (PSS.page_type == sub.c.page_type) & (PSS.observed_at == sub.c.max_obs))
            .order_by(PSS.page_type.asc())
        )
        rows = []
        for r in q.all():
            rows.append({
                "page_type": r.page_type,
                "url": r.url,
                "status_code": getattr(r, "status_code", None),
                "severity": getattr(r, "severity", None),
                "ttfb_ms": r.ttfb_ms,
                "total_ms": r.total_ms,
                "html_bytes": r.html_bytes,
                "headers": r.headers,
                "sanity": getattr(r, "sanity", None),
                "observed_at": r.observed_at,
            })
        return rows

    def ttfb_since(self, page_type: str, since_dt) -> list[int]:
        q = (
            select(PSS.ttfb_ms)
            .where(PSS.page_type == page_type)
            .where(PSS.observed_at >= since_dt)
            .order_by(PSS.observed_at.asc())
        )
        return [int(r[0] or 0) for r in self.db.execute(q).all()]

    def last_status(self, page_type: str) -> str | None:
        # 1) Se existir coluna 'status', usa-a diretamente (esperado "ok"/"error"/"warning"/"critical")
        if self._has_status:
            q = (
                select(PSS.status)
                .where(PSS.page_type == page_type)
                .order_by(PSS.observed_at.desc())
                .limit(1)
            )
            val = self.db.execute(q).scalar()
            if val is None:
                return None
            s = str(val).lower().strip()
            return "error" if s == "error" else "ok"

        # 2) Caso exista 'severity' (ex.: "ok" | "warning" | "critical"), mapeia para ok/error
        if self._has_severity:
            q = (
                select(PSS.severity)
                .where(PSS.page_type == page_type)
                .order_by(PSS.observed_at.desc())
                .limit(1)
            )
            sev = self.db.execute(q).scalar()
            if sev is None:
                return None
            s = str(sev).lower().strip()
            return "error" if s == "critical" else "ok"

        # 3) Caso só exista 'status_code', infere (>=500 => error)
        if self._has_status_code:
            q = (
                select(PSS.status_code)
                .where(PSS.page_type == page_type)
                .order_by(PSS.observed_at.desc())
                .limit(1)
            )
            code = self.db.execute(q).scalar()
            if code is None:
                return None
            try:
                code = int(code)
            except Exception:
                return "error"
            return "error" if code >= 500 else "ok"

        # 4) Sem forma de inferir
        return None

    def series_since(self, page_types: list[str], since_dt) -> list[dict]:
        q = (
            select(PSS.observed_at, PSS.page_type, PSS.ttfb_ms)
            .where(PSS.observed_at >= since_dt)
            .where(PSS.page_type.in_(page_types))
            .order_by(PSS.observed_at.asc())
        )
        rows = self.db.execute(q).all()
        out: dict[str, dict] = {}
        for ts, ptype, ttfb in rows:
            key = ts.isoformat() if hasattr(ts, "isoformat") else str(ts)
            slot = out.setdefault(key, {"ts": key})
            slot[f"{ptype}_ttfb_ms"] = int(ttfb or 0)
        return list(out.values())
