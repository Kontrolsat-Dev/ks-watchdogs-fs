from __future__ import annotations
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy import select, func, case
from sqlalchemy.orm import Session
from app.models.prestashop import PageSpeedSnapshot as PSS

class PageSpeedReadRepo:
    def __init__(self, db: Session):
        self.db = db
        self._dialect = db.bind.dialect.name  # "sqlite" | "postgresql" | ...
        # deteção dinâmica das colunas disponíveis
        self._has_status = hasattr(PSS, "status")
        self._has_severity = hasattr(PSS, "severity")
        self._has_status_code = hasattr(PSS, "status_code")

    # ---------------- existentes ----------------

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

    def last_status(self, page_type: str) -> Optional[str]:
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

    # ---------------- novos/melhorados ----------------

    def _bucket_expr(self, minutes: int):
        """
        Expressão SQL para bucket temporal:
        - SQLite: strftime + unixepoch
        - Outros: date_trunc('minute', ...) + offset
        """
        if self._dialect == "sqlite":
            # arredonda para múltiplos de N minutos
            secs = func.cast(func.strftime("%s", PSS.observed_at), int)
            bucket_start = (secs // (minutes * 60)) * (minutes * 60)
            # string "YYYY-MM-DD HH:MM"
            return func.strftime("%Y-%m-%d %H:%M", func.datetime(bucket_start, "unixepoch"))
        else:
            # fallback genérico (Postgres etc.)
            return func.date_trunc("minute", PSS.observed_at)

    def series_bucketized_since(
        self,
        page_types: list[str],
        since_dt: datetime,
        *,
        bucket_minutes: int = 5,
        max_points: int | None = 180,
    ) -> list[dict]:
        """
        Série agregada por buckets de minutos (AVG do TTFB por página).
        Reduz drasticamente linhas lidas/transferidas.
        """
        bkt = self._bucket_expr(bucket_minutes).label("bucket")

        home_avg = func.avg(case((PSS.page_type == "home", PSS.ttfb_ms))).label("home_ttfb_ms")
        product_avg = func.avg(case((PSS.page_type == "product", PSS.ttfb_ms))).label("product_ttfb_ms")

        q = (
            select(bkt, home_avg, product_avg)
            .where(PSS.observed_at >= since_dt)
            .where(PSS.page_type.in_(page_types))
            .group_by(bkt)
            .order_by(bkt)
        )
        rows = self.db.execute(q).all()
        series = []
        for ts, home_ms, prod_ms in rows:
            slot = {"ts": str(ts)}
            if home_ms is not None:
                slot["home_ttfb_ms"] = int(home_ms)
            if prod_ms is not None:
                slot["product_ttfb_ms"] = int(prod_ms)
            series.append(slot)

        if max_points and len(series) > max_points:
            # downsample por stride simples (leve e estável)
            from math import ceil
            stride = ceil(len(series) / max_points)
            series = series[::stride]
        return series

    def percentiles_since(self, page_type: str, since_dt: datetime) -> dict:
        """
        Percentis p50/p90/p95 de TTFB para uma página desde 'since_dt'.
        Implementado em SQL com window functions (SQLite >= 3.25 tem).
        Se não suportado, cai para AVG como aproximação.
        """
        try:
            # janela ordenada por ttfb
            base = (
                select(
                    PSS.ttfb_ms.label("v"),
                    func.row_number().over(order_by=PSS.ttfb_ms).label("rn"),
                    func.count().over().label("cnt"),
                )
                .where(PSS.page_type == page_type, PSS.observed_at >= since_dt)
                .subquery()
            )
            def nth(p: float):
                # posição 1-indexed
                return func.min(base.c.v).filter(base.c.rn == (func.cast(base.c.cnt * p, int) + 1))
            row = self.db.execute(select(nth(0.5), nth(0.9), nth(0.95))).first()
            p50, p90, p95 = row or (None, None, None)
            return {
                "p50_ttfb_ms": int(p50 or 0),
                "p90_ttfb_ms": int(p90 or 0),
                "p95_ttfb_ms": int(p95 or 0),
            }
        except Exception:
            # fallback barato: média
            avg_val = self.db.execute(
                select(func.avg(PSS.ttfb_ms)).where(PSS.page_type == page_type, PSS.observed_at >= since_dt)
            ).scalar()
            v = int(avg_val or 0)
            return {"p50_ttfb_ms": v, "p90_ttfb_ms": v, "p95_ttfb_ms": v}

    def last_status_inferred(self, page_type: str) -> Optional[str]:
        return self.last_status(page_type)

    def kpi_bucketed_with_stats(
        self, since_dt: datetime, *, bucket_minutes: int = 5, max_points: int | None = 180
    ) -> dict:
        """
        Atalho para devolver: { home: {p50,p90,p95,last_status}, product: {...}, series: [...] }
        """
        series = self.series_bucketized_since(["home", "product"], since_dt, bucket_minutes=bucket_minutes, max_points=max_points)
        home = self.percentiles_since("home", since_dt)
        product = self.percentiles_since("product", since_dt)
        home["last_status"] = self.last_status_inferred("home") or "ok"
        product["last_status"] = self.last_status_inferred("product") or "ok"
        return {"home": home, "product": product, "series": series}
