# app/services/commands/kpi/report_generate.py

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, is_dataclass
from datetime import date, datetime, timedelta
from typing import Any, Optional, Tuple, Literal
from zoneinfo import ZoneInfo

import requests

from app.core.config import settings
from app.services.read.kpi.kpi_query import KPIQueryService


Period = Literal["day", "week", "month", "year"]


# -----------------------------
# Helpers de datas e hashing
# -----------------------------
def _norm_date(s: Optional[str]) -> Optional[str]:
    """Aceita 'YYYY-MM-DD' ou 'DD-MM-YYYY' e devolve ISO 'YYYY-MM-DD'."""
    if not s:
        return s
    for fmt in ("%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(s, fmt).date().isoformat()
        except ValueError:
            continue
    # se vier noutro formato, devolvemos como veio
    return s


def _default_window_for_period(period: Period) -> Tuple[str, str]:
    """
    Janela por defeito por período.
    until é exclusivo (hoje+1).
    """
    today = date.today()
    if period == "day":
        since = today - timedelta(days=30)
    elif period == "week":
        since = today - timedelta(weeks=26)
    elif period == "month":
        since = date(today.year - 1, today.month, 1)
    else:  # "year"
        since = date(today.year - 5, 1, 1)
    until = today + timedelta(days=1)
    return since.isoformat(), until.isoformat()


def _json_default(o: Any):
    """Serializer default para json.dumps."""
    if is_dataclass(o):
        return asdict(o)
    if hasattr(o, "model_dump"):          # Pydantic v2
        return o.model_dump()
    if hasattr(o, "dict"):                # Pydantic v1
        return o.dict()
    if isinstance(o, (set,)):
        return list(o)
    # tenta um fallback mínimo por atributos comuns
    try:
        return {k: getattr(o, k) for k in dir(o) if not k.startswith("_")}
    except Exception:
        return repr(o)


def _hash_payload(payload: dict) -> str:
    s = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"), default=_json_default)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def _orders_per_hour(avg_min: float | None) -> float | None:
    if avg_min is None or avg_min <= 0:
        return None
    # 60 minutos / avg_min = pedidos por hora
    return round(60.0 / avg_min, 2)


# -----------------------------
# Normalizadores de dados KPI
# -----------------------------
def _asdict_performance(obj) -> dict:
    """Aceita Pydantic model ou dict e devolve dict simples."""
    if isinstance(obj, dict):
        return obj
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    # Fallback pelos campos esperados
    fields = ("role", "employee_id", "employee_name", "n_orders",
              "avg_min", "avg_h", "min_min", "max_min")
    out = {}
    for f in fields:
        if hasattr(obj, f):
            out[f] = getattr(obj, f)
    return out


def _with_orders_per_hour(d: dict) -> dict:
    d = dict(d)  # copy
    d["orders_per_hour"] = _orders_per_hour(d.get("avg_min"))
    return d


def _cast_series(employees: list) -> list[dict]:
    """
    Normaliza a timeseries para estruturas primitivas (dicts e listas),
    caso venham como Pydantic models.
    """
    out = []
    for e in employees:
        if isinstance(e, dict):
            ed = e
        elif hasattr(e, "model_dump"):
            ed = e.model_dump()
        elif hasattr(e, "dict"):
            ed = e.dict()
        else:
            ed = {
                "role": getattr(e, "role", None),
                "employee_id": getattr(e, "employee_id", None),
                "employee_name": getattr(e, "employee_name", None),
                "points": getattr(e, "points", []),
            }

        # garante pontos em dicts simples
        pts = []
        for p in ed.get("points", []):
            if isinstance(p, dict):
                pts.append(p)
            elif hasattr(p, "model_dump"):
                pts.append(p.model_dump())
            elif hasattr(p, "dict"):
                pts.append(p.dict())
            else:
                pts.append({
                    "bucket": getattr(p, "bucket", None),
                    "n_orders": getattr(p, "n_orders", None),
                    "avg_min": getattr(p, "avg_min", None),
                    "avg_h": getattr(p, "avg_h", None),
                })
        ed["points"] = pts
        out.append(ed)
    return out


# -----------------------------
# Serviço principal
# -----------------------------
class KPIReportGenerateService:
    """
    Gera (e opcionalmente reaproveita) um relatório de KPI para warehouse,
    enviando o payload para um fluxo n8n.

    API pública:
      - build_payload(period, since, until) -> (payload, since_iso, until_iso)
      - get_or_generate(period, since, until, force=False) -> dict
    """

    def __init__(self) -> None:
        self.kpi = KPIQueryService()

    # ---------- payload ----------
    def build_payload(
        self,
        *,
        period: Period = "day",
        since: Optional[str] = None,
        until: Optional[str] = None,
    ) -> tuple[dict, str, str]:
        # normalizar datas
        since = _norm_date(since)
        until = _norm_date(until)

        if since is None or until is None:
            s, u = _default_window_for_period(period)
            since = since or s
            until = until or u

        # Para o gráfico usamos gran igual ao período pedido
        gran = period

        # --- Timeseries (prep, invoice) ---
        inv_ts = self.kpi.employees_timeseries(role="invoice", gran=gran, since=since, until=until)
        prep_ts = self.kpi.employees_timeseries(role="prep",    gran=gran, since=since, until=until)

        inv_series_plain = _cast_series(inv_ts["series"])
        prep_series_plain = _cast_series(prep_ts["series"])

        # --- Performance "flat" (prep, invoice) ---
        inv_pf = self.kpi.employees_performance(
            role="invoice", since=since, until=until, order_by="avg", order_dir="asc", limit=1000
        )
        prep_pf = self.kpi.employees_performance(
            role="prep",    since=since, until=until, order_by="avg", order_dir="asc", limit=1000
        )

        inv_perf_plain = [_with_orders_per_hour(_asdict_performance(x)) for x in inv_pf["items"]]
        prep_perf_plain = [_with_orders_per_hour(_asdict_performance(x)) for x in prep_pf["items"]]

        payload = {
            "meta": {
                "period": period,
                "since": since,
                "until": until,
                "tz": settings.TIMEZONE,
                "generated_at": datetime.now(ZoneInfo(settings.TIMEZONE)).isoformat(),
                "prompt_version": 1,
                "version": 1,
            },
            "invoice": {
                "performance": inv_perf_plain,   # lista de dicts (orders_per_hour incluído)
                "timeseries":  inv_series_plain, # lista de series por employee
            },
            "prep": {
                "performance": prep_perf_plain,
                "timeseries":  prep_series_plain,
            },
        }
        return payload, since, until

    # ---------- exec + cache opcional ----------
    def get_or_generate(
        self,
        *,
        period: Period = "day",
        since: Optional[str] = None,
        until: Optional[str] = None,
        force: bool = False,
    ) -> dict:
        """
        - Monta e “hashea” o payload
        - Se force=False, poderias procurar em cache/BD por UID (aqui deixado como comentário)
        - Se não existir (ou force=True), POST para o n8n
        - Retorna metadados da execução e eventual resposta do n8n
        """
        payload, since_iso, until_iso = self.build_payload(period=period, since=since, until=until)

        data_hash = _hash_payload(payload)
        uid = f"kpi:{period}:{since_iso}:{until_iso}:{data_hash[:12]}"

        # (Opcional) cache/BD — exemplo de como ficaria:
        # if not force and self.repo:
        #     found = self.repo.get_by_uid(uid)
        #     if found:
        #         return {"ok": True, "uid": uid, "source": "cache", "payload": found.payload}

        # Preparar URL do n8n
        url = (settings.N8N_REPORT_WEBHOOK_URL or "").strip()
        if url and "://" not in url:
            # se o utilizador meter só host:port/..., força http://
            url = "http://" + url

        n8n_status = None
        n8n_error = None
        n8n_response_json: Any = None

        if url:
            headers = {
                "Content-Type": "application/json",
                "X-Report-UID": uid,
                "User-Agent": settings.PS_USER_AGENT,
            }
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=30)
                n8n_status = resp.status_code
                try:
                    n8n_response_json = resp.json()
                except Exception:
                    n8n_response_json = {"text": resp.text}
                resp.raise_for_status()
            except Exception as e:
                n8n_error = str(e)

        # (Opcional) guardar em BD:
        # if self.repo:
        #     self.repo.create(uid=uid, period=period, since=since_iso, until=until_iso, payload=payload)

        res = {
            "ok": n8n_error is None,
            "uid": uid,
            "meta": {
                "period": period,
                "since": since_iso,
                "until": until_iso,
                "tz": settings.TIMEZONE,
            },
            "n8n": {
                "url": url or None,
                "status_code": n8n_status,
                "error": n8n_error,
                "response": n8n_response_json,
            },
            "preview_sizes": {
                "invoice": {
                    "performance": len(payload["invoice"]["performance"]),
                    "timeseries_employees": len(payload["invoice"]["timeseries"]),
                },
                "prep": {
                    "performance": len(payload["prep"]["performance"]),
                    "timeseries_employees": len(payload["prep"]["timeseries"]),
                },
            },
        }
        return res
