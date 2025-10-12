// Delayed Orders
export type OrderLevel = "ok" | "warning" | "critical";

export interface DelayedOrder {
  id_order: number;
  reference: string;
  date_add: string; // ISO
  days_passed: number;
  id_state: number;
  state_name: string; // <- CORRIGIDO (era number)
  dropshipping: boolean;
  status: OrderLevel | string; // se o backend por vezes manda outro valor
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
