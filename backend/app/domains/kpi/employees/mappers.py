from collections import defaultdict
from .types import EmployeeSeries, EmployeePoint, EmployeePerformance

def rows_to_series(role: str, rows: list[dict]) -> list[EmployeeSeries]:
    by_emp = defaultdict(list)
    names  = {}
    for r in rows:
        emp_id = int(r.get("employee_id") or 0)
        names[emp_id] = (r.get("employee_name") or f"#{emp_id}").strip()
        by_emp[emp_id].append(EmployeePoint(
            bucket=str(r.get("bucket") or ""),
            n_orders=int(r.get("n_orders") or 0),
            avg_min=(float(r["avg_min"]) if r.get("avg_min") is not None else None),
            avg_h=(float(r["avg_h"]) if r.get("avg_h") is not None else None),
        ))
    out = []
    for emp_id, pts in by_emp.items():
        pts.sort(key=lambda p: p.bucket)  # bucket já vem ordenado, mas garantimos
        out.append(EmployeeSeries(role=role, employee_id=emp_id,
                                  employee_name=names.get(emp_id, f"#{emp_id}"),
                                  points=pts))
    # ordena por nome para UX estável
    out.sort(key=lambda s: (s.employee_name.lower(), s.employee_id))
    return out

def raw_to_performance(role: str, row: dict) -> EmployeePerformance:
    eid = int(row.get("employee_id") or 0)
    name = (row.get("employee_name") or f"#{eid}").strip()
    def _f(k):
        return (float(row[k]) if row.get(k) is not None else None)
    return EmployeePerformance(
        role=role,
        employee_id=eid,
        employee_name=name,
        n_orders=int(row.get("n_orders") or 0),
        avg_min=_f("avg_min"),
        avg_h=_f("avg_h"),
        min_min=_f("min_min"),
        max_min=_f("max_min"),
    )
