export const Endpoints = Object.freeze({
  // --------------------------------
  // ------------- BASE -------------
  // --------------------------------
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://192.168.1.5:8002/api/v1",
  // --------------------------------
  // ------- System Endpoints -------
  // --------------------------------
  HEALTHZ: import.meta.env.VITE_API_HEALTH_URL || "/healthz",
  RUNS: import.meta.env.VITE_API_RUNS || "/runs",
  // --------------------------------
  // ----- Prestashop Endpoints -----
  // --------------------------------
  PRESTASHOP_PAYMENTS: import.meta.env.VITE_PRESTASHOP_PAYMENTS || "/payments",
  PRESTASHOP_ORDERS_DELAYED:
    import.meta.env.VITE_PRESTASHOP_ORDERS_DELAYED || "/orders/delayed",
  PRESTASHOP_ABANDONED_CARTS:
    import.meta.env.VITE_PRESTASHOP_ABANDONED_CARTS || "/carts/abandoned",
  VITE_PRESTASHOP_PAGES_STATUS:
    import.meta.env.VITE_PRESTASHOP_PAGES_STATUS || "/pagespeed",
  PRESTASHOP_PRODUCTS_EOL:
    import.meta.env.VITE_PRESTASHOP_PRODUCTS_EOL || "/products/eol",
  // --------------------------------
  // -------- KPI Endpoints ---------
  // --------------------------------
  KPI_EMPLOYEE_ORDERS_PROCESSING_TIMESERIES:
    import.meta.env.VITE_KPI_EMPLOYEE_ORDERS_PROCESSING_TIMESERIES ||
    "kpi/employees/timeseries",
  KPI_EMPLOYEE_ORDERS_PROCESSING_PERFORMANCE:
    import.meta.env.VITE_KPI_EMPLOYEE_ORDERS_PROCESSING_PERFORMANCE ||
    "/kpi/employees/performance",
});
