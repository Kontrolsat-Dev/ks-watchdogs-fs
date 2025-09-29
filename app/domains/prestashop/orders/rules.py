from app.shared.status import Status

def classify_order_delay(
    days: int,
    dropshipping: bool,
    warn_std: int,
    crit_std: int,
    warn_drop: int,
    crit_drop: int,
) -> Status:
    warn = warn_drop if dropshipping else warn_std
    crit = crit_drop if dropshipping else crit_std
    if days >= crit:
        return Status.CRITICAL
    if days >= warn:
        return Status.WARNING
    return Status.OK
