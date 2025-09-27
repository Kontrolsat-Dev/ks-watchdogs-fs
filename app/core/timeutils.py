from datetime import timezone
try:
    from zoneinfo import ZoneInfo
except Exception:  # ambientes sem zoneinfo
    ZoneInfo = None  # type: ignore

def get_local_tz(tz_key: str):
    # 1) Tenta ZoneInfo + tzdata
    if ZoneInfo is not None:
        try:
            return ZoneInfo(tz_key)
        except Exception:
            pass
    # 2) Fallback: python-dateutil (na maioria dos projetos já está instalado)
    try:
        from dateutil.tz import gettz
        tz = gettz(tz_key)
        if tz:
            return tz
    except Exception:
        pass
    # 3) Último recurso: UTC (sem DST)
    return timezone.utc
