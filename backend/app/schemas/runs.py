from typing import Literal, Any, Dict, List
from enum import Enum
from pydantic import BaseModel, Field

class CheckStatus(str, Enum):
    ok = "ok"
    error = "error"
    critical = "error"
    warning = "warning"

class CheckRunDTO(BaseModel):
    id: int
    check_name: str
    status: CheckStatus
    duration_ms: int
    payload: Dict[str, Any] = Field(default_factory=dict)
    created_at: str

class RunsListDTO(BaseModel):
    ok: bool
    count: int
    runs: List[CheckRunDTO]
