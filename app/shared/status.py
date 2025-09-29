from enum import StrEnum
from typing import Literal, Union

class Status(StrEnum):
    OK = "ok"
    WARNING = "warning"
    CRITICAL = "critical"

# Se quiseres manter Literals nalgum sítio:
StatusLiteral = Literal["ok", "warning", "critical"]

# Aceita str ou Enum (útil em helpers)
StatusType = Union[Status, StatusLiteral, str]

# Ranking de severidade
_SEVERITY_RANK = {
    Status.CRITICAL: 0, Status.WARNING: 1, Status.OK: 2,
    "critical": 0, "warning": 1, "ok": 2,   # também aceita strings
}
def status_rank(s: StatusType) -> int:
    return _SEVERITY_RANK.get(s, 3)
