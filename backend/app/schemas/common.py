# app/schemas/common.py
# Schemas comuns para todas as APIs.

from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel
T = TypeVar("T")

class PageMeta(BaseModel):
    page: int
    page_size: int
    total: Optional[int] = None
    has_next: bool
    has_prev: bool

class Page(BaseModel, Generic[T]):
    items: List[T]
    meta: PageMeta
