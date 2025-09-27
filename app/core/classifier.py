from dataclasses import dataclass
from typing import Literal

Status = Literal["ok", "warning", "critical"]

@dataclass
class Classification:
    status: Status
    hours: float  # arredondado a 1 casa

def classify_by_hours(hours: float, warn_h: int, crit_h: int) -> Status:
    if hours == float("inf"):
        return "critical"
    if hours >= crit_h:
        return "critical"
    if hours >= warn_h:
        return "warning"
    return "ok"
