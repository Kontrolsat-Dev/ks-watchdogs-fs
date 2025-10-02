from typing import Literal, Any, Dict, List
from pydantic import BaseModel

class CheckRunDTO(BaseModel):
    id: int
    check_name: str
    status: Literal["ok", "error"]
    duration_ms: int
    payload: Dict[str, Any] = {}
    created_at: str  # ISO string

class RunsListDTO(BaseModel):
    ok: bool
    count: int
    runs: List[CheckRunDTO]
