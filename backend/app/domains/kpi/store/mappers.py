# app/domains/kpi/store/mappers.py

from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, Iterable, List

from .types import StoreBucket, StoreEmployeePerformance, StoreDocTypeDaily


def _parse_date(d: str) -> str:
    """
    Recebe '2025-11-21 00:00:00' ou ISO e devolve 'YYYY-MM-DD'.
    """
    d = (d or "").strip()
    if not d:
        return ""
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(d, fmt).date().isoformat()
        except ValueError:
            continue
    # fallback: devolve como veio (pior das hipóteses)
    return d.split(" ")[0]


def _to_float(v: Any) -> float:
    try:
        return float(str(v).replace(",", "."))
    except Exception:
        return 0.0


def to_timeseries_daily(rows: Iterable[Dict[str, Any]]) -> List[StoreBucket]:
    by_date: Dict[str, Dict[str, float]] = defaultdict(lambda: {"n": 0, "total": 0.0})

    for r in rows:
        if r.get("event_type") != "document_created":
            continue
        date_key = _parse_date(r.get("document_creation_date") or "")
        if not date_key:
            continue
        total = _to_float(r.get("document_total"))
        agg = by_date[date_key]
        agg["n"] += 1
        agg["total"] += total

    out: List[StoreBucket] = []
    for date_key in sorted(by_date.keys()):
        agg = by_date[date_key]
        out.append(
            StoreBucket(
                bucket=date_key,
                n_orders=int(agg["n"]),
                total_amount=round(agg["total"], 2),
            )
        )
    return out


def to_employee_performance(
    rows: Iterable[Dict[str, Any]],
) -> List[StoreEmployeePerformance]:
    by_emp: Dict[int, Dict[str, Any]] = defaultdict(
        lambda: {"name": "", "n": 0, "total": 0.0}
    )

    for r in rows:
        if r.get("event_type") != "document_created":
            continue
        emp_id = int(r.get("employee_id") or 0)
        if emp_id <= 0:
            continue
        total = _to_float(r.get("document_total"))
        slot = by_emp[emp_id]
        slot["name"] = (r.get("employee_name") or slot["name"] or f"#{emp_id}").strip()
        slot["n"] += 1
        slot["total"] += total

    out: List[StoreEmployeePerformance] = []
    for emp_id, slot in by_emp.items():
        n = int(slot["n"])
        total = float(slot["total"])
        avg = total / n if n > 0 else 0.0
        out.append(
            StoreEmployeePerformance(
                employee_id=emp_id,
                employee_name=slot["name"] or f"#{emp_id}",
                n_orders=n,
                total_amount=round(total, 2),
                avg_ticket=round(avg, 2),
            )
        )

    # ordena por total desc
    out.sort(key=lambda e: (-e.total_amount, e.employee_name.lower(), e.employee_id))
    return out


def to_doc_type_daily(rows: Iterable[Dict[str, Any]]) -> List[StoreDocTypeDaily]:
    key_agg: Dict[tuple, Dict[str, float]] = defaultdict(lambda: {"n": 0, "total": 0.0})

    for r in rows:
        if r.get("event_type") != "document_created":
            continue
        date_key = _parse_date(r.get("document_creation_date") or "")
        if not date_key:
            continue
        doc_type = (r.get("document_type") or "").strip() or "UNK"
        total = _to_float(r.get("document_total"))
        key = (date_key, doc_type)
        agg = key_agg[key]
        agg["n"] += 1
        agg["total"] += total

    out: List[StoreDocTypeDaily] = []
    for (date_key, doc_type), agg in sorted(key_agg.items()):
        n = int(agg["n"])
        total = float(agg["total"])
        avg = total / n if n > 0 else 0.0
        out.append(
            StoreDocTypeDaily(
                date=date_key,
                document_type=doc_type,
                n_orders=n,
                total_amount=round(total, 2),
                avg_ticket=round(avg, 2),
            )
        )
    return out
