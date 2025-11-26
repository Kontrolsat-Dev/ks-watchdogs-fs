from pydantic import BaseModel, Field
from typing import List, Optional, Literal


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


class KPIReportOutDTO(BaseModel):
    ok: bool
    cached: bool
    report_id: str
    period: Literal["day", "week", "month", "year"]
    since: str
    until: str
    generated_at: str
    model: str | None = None
    token_input: int | None = None
    token_output: int | None = None
    text: str


# In Store Purchases Metrics


class StoreTimeseriesPoint(BaseModel):
    bucket: str
    n_orders: int
    total_amount: float


class StoreEmployeePerformanceOut(BaseModel):
    employee_id: int
    employee_name: str
    n_orders: int
    total_amount: float
    avg_ticket: float


class StoreDocTypeDailyOut(BaseModel):
    date: str
    document_type: str
    n_orders: int
    total_amount: float
    avg_ticket: float


class InStorePurchasesDTO(BaseModel):
    ok: bool = True
    since: str
    count_events: int
    timeseries_daily: List[StoreTimeseriesPoint] = Field(default_factory=list)
    employees: List[StoreEmployeePerformanceOut] = Field(default_factory=list)
    doc_type_daily: List[StoreDocTypeDailyOut] = Field(default_factory=list)
