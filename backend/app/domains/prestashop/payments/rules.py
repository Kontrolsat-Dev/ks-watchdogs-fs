from app.shared.status import Status

def classify_payment_staleness(hours: float, warn_h: int, crit_h: int) -> Status:
    if hours == float("inf") or hours >= crit_h:
        return Status.CRITICAL
    if hours >= warn_h:
        return Status.WARNING
    return Status.OK
