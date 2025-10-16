from pydantic import BaseModel
from typing import List, Optional

class EmployeePointDTO(BaseModel):
    bucket: str
    n_orders: int
    avg_min: Optional[float] = None
    avg_h: Optional[float] = None

class EmployeeSeriesDTO(BaseModel):
    role: str
    employee_id: int
    employee_name: str
    points: List[EmployeePointDTO]

class EmployeeTimeseriesDTO(BaseModel):
    ok: bool
    role: str
    gran: str
    since: str
    until: str
    count: int
    employees: List[EmployeeSeriesDTO]

class EmployeePerformanceItemDTO(BaseModel):
    role: str
    employee_id: int
    employee_name: str
    n_orders: int
    avg_min: Optional[float] = None
    avg_h: Optional[float] = None
    min_min: Optional[float] = None
    max_min: Optional[float] = None

class EmployeePerformanceDTO(BaseModel):
    ok: bool
    role: str
    since: str
    until: str
    order_by: str
    order_dir: str
    limit: int
    count: int
    items: List[EmployeePerformanceItemDTO]
