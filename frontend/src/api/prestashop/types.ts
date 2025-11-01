// Delayed Orders
export type OrderLevel = "ok" | "warning" | "critical";

export interface DelayedOrder {
  id_order: number;
  reference: string;
  date_add: string; // ISO
  days_passed: number;
  id_state: number;
  state_name: string;
  dropshipping: boolean;
  status: OrderLevel | string;
  observed_at: string; // ISO
}

export interface DelayedOrdersResponse {
  ok: boolean;
  count: number;
  orders: DelayedOrder[] | null;
}

// Payments
export interface PaymentMethod {
  method: string;
  last_payment_at: string;
  status: string;
  observed_at: string;
}

export interface PaymentsResponse {
  ok: boolean;
  count: number;
  methods?: PaymentMethod[];
}

// Products
export interface ProductsEolCount {
  warning: number;
  critical: number;
  ok: number;
  total: number;
}

export interface ProductEol {
  id_product: number;
  name: string;
  reference: string;
  ean13: string;
  upc: string;
  price: boolean;
  last_in_stock_at: string;
  days_since: number;
  status: string;
  observed_at: string;
}

export interface ProductsEolReponse {
  ok: boolean;
  count: number;
  counts?: ProductsEolCount;
  items?: ProductEol[];
}

// Abandoned carts
export interface CartAbandoned {
  id_cart: number;
  id_customer: number;
  hours_stale: number;
  items: number;
  status: "ok" | "warning" | "critical" | string;
  observed_at: string;
}

export interface CartAbandonedResponse {
  ok: boolean;
  count: number;
  items: CartAbandoned[];
}

// Page Speed
export type PageHeaders = {
  content_type?: string;
  cache_control?: string;
  age?: string;
  server?: string;
  cf_cache_status?: string;
  x_cache?: string;
};

export type PageSanity = {
  title_ok?: boolean | null;
  title_len?: number | null;
  meta_desc_ok?: boolean | null;
  meta_desc_len?: number | null;
  h1_ok?: boolean | null;
  canonical_ok?: boolean | null;
  jsonld_product_ok?: boolean | null;
  blocking_scripts_in_head?: number | null;
};

export type PerfItem = {
  page_type: string;
  url: string;
  status: "ok" | "warning" | "critical" | string;
  status_code: number;
  ttfb_ms: number;
  total_ms: number;
  html_bytes: number;
  headers: PageHeaders;
  sanity: PageSanity;
  observed_at: string; // ISO
};

export type PerfResponse = {
  ok: boolean;
  count: number;
  items?: PerfItem[];
  elapsedMs?: number;
};
