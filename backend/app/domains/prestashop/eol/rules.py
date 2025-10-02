from app.shared.status import Status

def classify_eol_days(days: int, warn_d: int, crit_d: int) -> Status:
    if days >= crit_d: return Status.CRITICAL
    if days >= warn_d: return Status.WARNING
    return Status.OK