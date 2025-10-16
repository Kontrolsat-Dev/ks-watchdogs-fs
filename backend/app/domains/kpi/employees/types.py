from dataclasses import dataclass
from typing import Optional

@dataclass(slots=True)
class EmployeePoint:
    bucket: str
    n_orders: int
    avg_min: float | None
    avg_h: float | None

@dataclass(slots=True)
class EmployeeSeries:
    role: str
    employee_id: int
    employee_name: str
    points: list[EmployeePoint]

@dataclass(slots=True)
class EmployeePerformance:
    role: str
    employee_id: int
    employee_name: str
    n_orders: int
    avg_min: Optional[float]
    avg_h: Optional[float]
    min_min: Optional[float]
    max_min: Optional[float]