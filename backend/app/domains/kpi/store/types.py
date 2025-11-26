# app/domains/kpi/store/types.py

from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass(slots=True)
class StoreBucket:
    bucket: str  # ex: '2025-11-21'
    n_orders: int
    total_amount: float


@dataclass(slots=True)
class StoreEmployeePerformance:
    employee_id: int
    employee_name: str
    n_orders: int
    total_amount: float
    avg_ticket: float


@dataclass(slots=True)
class StoreDocTypeDaily:
    date: str  # 'YYYY-MM-DD'
    document_type: str  # ex: 'FR'
    n_orders: int
    total_amount: float
    avg_ticket: float
