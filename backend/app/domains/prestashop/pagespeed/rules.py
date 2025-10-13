from app.shared.status import Status

def classify_pagespeed(
    status_code: int,
    ttfb_ms: int, total_ms: int, html_bytes: int,
    sanity_reasons_critical: int, sanity_reasons_warning: int,
    ttfb_warn=400, ttfb_crit=800,
    total_warn=1000, total_crit=2000,
    html_warn=100_000, html_crit=300_000,
) -> Status:
    if status_code >= 400:
        return Status.CRITICAL
    crit = (
        ttfb_ms >= ttfb_crit or
        total_ms >= total_crit or
        html_bytes >= html_crit or
        sanity_reasons_critical > 0
    )
    warn = (
        ttfb_ms >= ttfb_warn or
        total_ms >= total_warn or
        html_bytes >= html_warn or
        sanity_reasons_warning > 0
    )
    if crit: return Status.CRITICAL
    if warn: return Status.WARNING
    return Status.OK
