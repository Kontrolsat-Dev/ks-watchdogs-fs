// src/api/kpi/types.ts

export type EmployeeRole = "prep" | "invoice";
export type Granularity = "day" | "week" | "month" | "year";
export type OrderBy = "avg" | "n" | "min" | "max";
export type OrderDir = "asc" | "desc";

// -------- Timeseries --------
export interface EmployeePoint {
  bucket: string; // ex: "2025-10-01" (ou chave temporal equivalente)
  n_orders: number;
  avg_min: number;
  avg_h: number;
}

export interface EmployeeSeries {
  role: EmployeeRole;
  employee_id: number;
  employee_name: string;
  points: EmployeePoint[];
}

export interface EmployeeTimeseriesResponse {
  ok: boolean;
  role: string;
  gran: string;
  since: string; // DD-MM-YYYY
  until: string; // DD-MM-YYYY
  count: number;
  employees: EmployeeSeries[];
}

// -------- Performance --------
export interface EmployeePerformanceItem {
  role: EmployeeRole;
  employee_id: number;
  employee_name: string;
  n_orders: number;
  avg_min: number;
  avg_h: number;
  min_min: number;
  max_min: number;
}

export interface EmployeePerformanceResponse {
  ok: boolean;
  role: string;
  since: string; // DD-MM-YYYY
  until: string; // DD-MM-YYYY
  order_by: string; // "avg" | "n" | "min" | "max"
  order_dir: string; // "asc" | "desc"
  limit: number;
  count: number;
  items: EmployeePerformanceItem[];
}

// ========= Store Front Metrics =========

// Ponto da timeseries diária de vendas em loja
export interface StoreTimeseriesPoint {
  bucket: string; // ex: "2025-11-21"
  n_orders: number; // nº de documentos nesse dia
  total_amount: number; // soma dos document_total
}

// Ranking por funcionário na loja física
export interface StoreEmployeePerformanceItem {
  employee_id: number;
  employee_name: string;
  n_orders: number;
  total_amount: number;
  avg_ticket: number;
}

// Totais por dia + tipo de documento (FR, ELO, NRE, ...)
export interface StoreDocTypeDailyItem {
  date: string; // "2025-11-21"
  document_type: string; // ex: "FR"
  n_orders: number;
  total_amount: number;
  avg_ticket: number;
}

// Resposta principal da API /kpi/reports/employees/store-metrics
export interface StoreFrontMetricsResponse {
  ok: boolean;
  since: string; // backend está a devolver ISO: "2025-10-27T00:00:00"
  count_events: number;
  timeseries_daily: StoreTimeseriesPoint[];
  employees: StoreEmployeePerformanceItem[];
  doc_type_daily: StoreDocTypeDailyItem[];
}
