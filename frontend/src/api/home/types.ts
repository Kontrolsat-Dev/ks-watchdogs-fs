// api/home/type.ts

export type ISODateTime = string;

/** Status normalizado das runs (warning/critical => "ok") */
export type RunStatus = "ok" | "error";

export interface CheckCard {
  name: string;
  last_status: RunStatus;
  last_run_ms: number;
  last_run_at: ISODateTime;
}

/** Payments */
export interface PaymentMethodLast {
  method: string;
  last_payment_at: ISODateTime | null;
  age_minutes: number | null;
}
export interface PaymentsKpi {
  last_per_method: PaymentMethodLast[];
}

/** Orders delayed */
export interface OrdersDelayedSeriesPoint {
  ts: string;
  total: number;
}
export interface OrdersDelayedKpi {
  total: number;
  by_type: { std: number; dropship: number };
  delta_24h: number;
  series: OrdersDelayedSeriesPoint[];
}

/** PageSpeed */
export type PagespeedStatus = "ok" | "error";
export interface PagespeedBucket {
  p50_ttfb_ms: number;
  p90_ttfb_ms: number;
  p95_ttfb_ms: number;
  last_status: PagespeedStatus;
}
export interface PagespeedSeriesPoint {
  ts: string;
  home_ttfb_ms?: number;
  product_ttfb_ms?: number;
}
export interface PagespeedKpi {
  home: PagespeedBucket;
  product: PagespeedBucket;
  series: PagespeedSeriesPoint[];
}

/** Carts (stale) */
export interface CartsStaleSeriesPoint {
  ts: string;
  count: number;
}
export interface CartsStaleKpi {
  over_threshold: number;
  series: CartsStaleSeriesPoint[];
}

/** EOL products */
export interface EolSeriesPoint {
  ts: string;
  warn: number;
  critical: number;
}
export interface EolKpi {
  warn: number;
  critical: number;
  series: EolSeriesPoint[];
}

/** KPI envelope (chaves opcionais consoante o backend preenche) */
export interface HomeKpis {
  payments?: PaymentsKpi;
  orders_delayed?: OrdersDelayedKpi;
  pagespeed?: PagespeedKpi;
  carts_stale?: CartsStaleKpi;
  eol?: EolKpi;
}

/** Mapa de erros por secção */
export type HomeErrors = Record<string, string | null>;

/** Resposta principal da home */
export interface HomeSummary {
  v: number;
  now_iso: ISODateTime;
  last_update_iso: ISODateTime;
  checks: CheckCard[];
  kpis: HomeKpis;
  errors: HomeErrors;
}
