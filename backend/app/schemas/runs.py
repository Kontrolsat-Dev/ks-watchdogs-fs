from typing import Any, Dict, List, Literal
from pydantic import BaseModel, Field

class CheckRunDTO(BaseModel):
    id: int
    check_name: str
    status: Literal["ok", "error"]
    duration_ms: int
    payload: Dict[str, Any] = Field(default_factory=dict)
    created_at: str  # ISO

class RunsListDTO(BaseModel):
    ok: bool
    count: int
    runs: List[CheckRunDTO]
