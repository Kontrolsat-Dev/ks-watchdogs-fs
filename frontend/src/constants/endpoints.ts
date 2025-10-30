const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Se vier absoluta (http/https), usa tal e qual; se vier relativa (/api/v1),
// converte para absoluta com base no origin atual (ex.: https://wd.kontrolsat.com)
const BASE_ABSOLUTE = /^https?:\/\//i.test(RAW_BASE)
  ? RAW_BASE
  : new URL(RAW_BASE, window.location.origin).toString().replace(/\/$/, "");

export const Endpoints = Object.freeze({
  // --------------------------------
  // ------------- BASE -------------
  // --------------------------------
  BASE_URL: BASE_ABSOLUTE,
  // --------------------------------
  // ------- System Endpoints -------
  // --------------------------------
  HEALTHZ: import.meta.env.VITE_API_HEALTH_URL || "/healthz",
  RUNS: import.meta.env.VITE_API_RUNS || "/runs",
  // --------------------------------
  // ------- System Endpoints -------
  // --------------------------------
  AUTH_LOGIN: import.meta.env.VITE_API_AUTH_LOGIN || "/auth/login",
  AUTH_ME: import.meta.env.VITE_API_AUTH_ME || "/auth/me",
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
