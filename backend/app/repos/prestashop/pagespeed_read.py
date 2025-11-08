from __future__ import annotations

from typing import Iterable, List, Dict
from sqlalchemy import select, func, Integer
from sqlalchemy.orm import Session
from app.models.prestashop import PageSpeedSnapshot as PSS

class PageSpeedReadRepo:
    def __init__(self, db: Session):
        self.db = db
        self._has_status = hasattr(PSS, "status")
        self._has_severity = hasattr(PSS, "severity")
        self._has_status_code = hasattr(PSS, "status_code")

    def latest_by_page_type(self) -> list[dict]:
        sub = (
            select(
                PSS.page_type,
                func.max(PSS.observed_at).label("max_obs"),
            )
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
            return "error" if str(val).lower().strip() == "error" else "ok"

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
            return "error" if str(sev).lower().strip() == "critical" else "ok"

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

        return None

    def series_bucketted(
        self,
        page_types: Iterable[str],
        since_dt,
        bucket_minutes: int,
    ) -> List[Dict]:
        """
        Agrupa por balde de N minutos e devolve média do TTFB por (bucket, page_type).
        Evita varrer todos os pontos.
        """
        # segundos desde epoch
        sec = func.cast(func.strftime("%s", PSS.observed_at), Integer)
        bucket_len = int(bucket_minutes * 60)
        # id de balde = floor(sec / bucket_len)
        bucket_id = func.cast(sec / bucket_len, Integer).label("bucket_id")
        # timestamp (segundos) do balde
        bucket_sec = (bucket_id * bucket_len).label("bucket_sec")

        q = (
            select(
                bucket_sec.label("bsec"),
                PSS.page_type,
                func.avg(PSS.ttfb_ms).label("avg_ttfb"),
            )
            .where(PSS.observed_at >= since_dt)
            .where(PSS.page_type.in_(list(page_types)))
            .group_by("bsec", PSS.page_type)
            .order_by("bsec")
        )
        rows = self.db.execute(q).all()

        # pivot para {ts, home_ttfb_ms?, product_ttfb_ms?}
        from datetime import datetime, timezone
        by_bucket: Dict[int, Dict] = {}
        for bsec, ptype, avg_ttfb in rows:
            ts = datetime.fromtimestamp(int(bsec), tz=timezone.utc).isoformat()
            slot = by_bucket.setdefault(int(bsec), {"ts": ts})
            slot[f"{ptype}_ttfb_ms"] = int(round(float(avg_ttfb or 0)))

        # ordena por bsec
        return [by_bucket[k] for k in sorted(by_bucket.keys())]
