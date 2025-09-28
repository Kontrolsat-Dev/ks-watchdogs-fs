from typing import Literal
Status = Literal["ok", "warning", "critical"]

def classify_by_hours(hours: float, warn_h: int, crit_h: int) -> Status:
    # horas infinitas (data inválida) contam como crítico
    if hours == float("inf"):
        return "critical"
    if hours >= crit_h:
        return "critical"
    if hours >= warn_h:
        return "warning"
    return "ok"
