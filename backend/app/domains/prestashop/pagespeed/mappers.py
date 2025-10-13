import json, re
from bs4 import BeautifulSoup
from app.domains.prestashop.pagespeed.types import PageSpeed, PageType
from app.domains.prestashop.pagespeed.rules import classify_pagespeed
from app.shared.status import Status
from app.core.config import settings

def _sanity_from_html(html: str, page_type: PageType, *,
                      jsonld_critical: bool = True,
                      ignore_warn_keys: set[str] = frozenset()) -> tuple[dict, int, int]:
    soup = BeautifulSoup(html, "html.parser")
    title = (soup.title.string or "").strip() if soup.title else ""
    md = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
    meta_desc = (md.get("content") or "").strip() if md else ""

    h1_ok = soup.find("h1") is not None
    canonical_ok = soup.find("link", rel=re.compile("^canonical$", re.I)) is not None

    blocking = 0
    head = soup.find("head")
    if head:
        for s in head.find_all("script", src=True):
            if not s.has_attr("defer") and not s.has_attr("async"):
                blocking += 1

    jsonld_ok = None
    if page_type == "product":
        jsonld_ok = False
        for tag in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(tag.string or "{}")
            except Exception:
                continue
            candidates = data if isinstance(data, list) else [data]
            for obj in candidates:
                t = obj.get("@type") or obj.get("@graph", [{}])[0].get("@type")
                if (t == "Product") or (isinstance(t, list) and "Product" in t):
                    sku = obj.get("sku")
                    gtin = obj.get("gtin") or obj.get("gtin13") or obj.get("gtin8") or obj.get("gtin14")
                    offers = obj.get("offers") or {}
                    price = (offers.get("price") if isinstance(offers, dict) else None)
                    if sku and (gtin or price):
                        jsonld_ok = True
                        break
            if jsonld_ok:
                break

    sanity = {
        "title_ok": 30 <= len(title) <= 65, "title_len": len(title),
        "meta_desc_ok": 80 <= len(meta_desc) <= 160, "meta_desc_len": len(meta_desc),
        "h1_ok": h1_ok, "canonical_ok": canonical_ok,
        "jsonld_product_ok": jsonld_ok, "blocking_scripts_in_head": blocking,
    }

    warn_keys = []
    if not sanity["title_ok"]: warn_keys.append("title_ok")
    if not sanity["meta_desc_ok"]: warn_keys.append("meta_desc_ok")
    if not sanity["h1_ok"]: warn_keys.append("h1_ok")
    if not sanity["canonical_ok"]: warn_keys.append("canonical_ok")
    if sanity["blocking_scripts_in_head"] > 0: warn_keys.append("blocking_scripts_in_head")

    warn = sum(1 for k in warn_keys if k not in ignore_warn_keys)
    crit = 0
    if sanity["jsonld_product_ok"] is False:
        if jsonld_critical: crit += 1
        else: warn += 1

    return sanity, crit, warn

def raw_to_domain(
    *,
    page_type: PageType,
    url: str,
    status_code: int,
    ttfb_ms: int,
    total_ms: int,
    html_bytes: int,
    headers: dict,
    html_text: str,
) -> PageSpeed:
    ignore_warn_keys = set(settings.PS_PAGESPEED_IGNORE_WARN_KEYS or [])
    sanity, crit_n, warn_n = _sanity_from_html(
        html_text, page_type,
        jsonld_critical=settings.PS_PAGESPEED_JSONLD_IS_CRITICAL,
        ignore_warn_keys=ignore_warn_keys,
    )

    if page_type == "home":
        status = classify_pagespeed(
            status_code, ttfb_ms, total_ms, html_bytes,
            sanity_reasons_critical=crit_n,
            sanity_reasons_warning=0 if settings.PS_PAGESPEED_IGNORE_SANITY_WARNINGS else warn_n,
            ttfb_warn=settings.PS_PAGESPEED_HOME_TTFB_WARN,
            ttfb_crit=settings.PS_PAGESPEED_HOME_TTFB_CRIT,
            total_warn=settings.PS_PAGESPEED_HOME_TOTAL_WARN,
            total_crit=settings.PS_PAGESPEED_HOME_TOTAL_CRIT,
            html_warn=settings.PS_PAGESPEED_HOME_HTML_WARN,
            html_crit=settings.PS_PAGESPEED_HOME_HTML_CRIT,
        )
    else:
        status = classify_pagespeed(
            status_code, ttfb_ms, total_ms, html_bytes,
            sanity_reasons_critical=crit_n,
            sanity_reasons_warning=0 if settings.PS_PAGESPEED_IGNORE_SANITY_WARNINGS else warn_n,
            ttfb_warn=settings.PS_PAGESPEED_PRODUCT_TTFB_WARN,
            ttfb_crit=settings.PS_PAGESPEED_PRODUCT_TTFB_CRIT,
            total_warn=settings.PS_PAGESPEED_PRODUCT_TOTAL_WARN,
            total_crit=settings.PS_PAGESPEED_PRODUCT_TOTAL_CRIT,
            html_warn=settings.PS_PAGESPEED_PRODUCT_HTML_WARN,
            html_crit=settings.PS_PAGESPEED_PRODUCT_HTML_CRIT,
        )

    return PageSpeed(
        page_type=page_type,
        url=url,
        status_code=status_code,
        ttfb_ms=ttfb_ms,
        total_ms=total_ms,
        html_bytes=html_bytes,
        headers=headers,
        sanity=sanity,
        status=status,
    )
