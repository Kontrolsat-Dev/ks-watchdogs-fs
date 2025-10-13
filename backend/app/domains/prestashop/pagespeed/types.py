from dataclasses import dataclass
from typing import Literal
from app.shared.status import Status

PageType = Literal["home", "product"]

@dataclass(slots=True)
class PageSpeed:
    page_type: PageType
    url: str
    status_code: int
    ttfb_ms: int
    total_ms: int
    html_bytes: int
    headers: dict
    sanity: dict
    status: Status
