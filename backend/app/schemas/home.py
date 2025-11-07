from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

class CheckCardOut(BaseModel):
    name: str
    last_status: Literal["ok", "error"]
    last_run_ms: int
    last_run_at: str

class HomeSummaryOut(BaseModel):
    v: int = 1
    now_iso: str
    last_update_iso: str
    checks: List[CheckCardOut] = Field(default_factory=list)
    kpis: Dict[str, Any] = Field(default_factory=dict)
    errors: Dict[str, Optional[str]] = Field(default_factory=dict)
