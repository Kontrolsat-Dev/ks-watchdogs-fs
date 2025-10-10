export const Endpoints = Object.freeze({
  // --------------------------------
  // ------------- BASE -------------
  // --------------------------------
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  // --------------------------------
  // ------- System Endpoints -------
  // --------------------------------
  HEALTHZ: import.meta.env.VITE_API_HEALTH_URL || "/healthz",
  // --------------------------------
  // ----- Prestashop Endpoints -----
  // --------------------------------
  PRESTASHOP_PAYMENTS: import.meta.env.VITE_PRESTASHOP_PAYMENTS || "/payments",
  PRESTASHOP_ORDERS_DELAYED:
    import.meta.env.VITE_PRESTASHOP_ORDERS_DELAYED || "/orders/delayed",
  PRESTASHOP_PAGES_STATUS_HOMEPAGE:
    import.meta.env.VITE_PRESTASHOP_PAGES_STATUS_HOMEPAGE ||
    "/page-status/homepage",
  PRESTASHOP_PRODUCTS_EOL:
    import.meta.env.VITE_PRESTASHOP_PRODUCTS_EOL || "/products/eol",
});
