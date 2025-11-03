// ✅ Correções em src/api/tools/types.ts

export interface Pagination {
  page: number;
  page_size: number;
  total: number; // <-- era 12
  has_next: boolean;
  has_prev: boolean;
}

// Pda
export interface PdaReport {
  id: number;
  code: string;
  context_json: string;
  error_text: string;
  stack_text: string;
  log_mode: string;
  ts_client: string;
  state: string;
  // ⚠️ Confere com o backend: usas "date_added"/"date_updated" aqui,
  // mas no backend tens devolvido "date_add"/"date_upd" (ou ISO).
  // Mantém consistente:
  date_added: string;
  date_updated: string;
}

export interface PdaReportsResponse {
  items: PdaReport[];
  meta: Pagination; // <-- era Pagination[]
}

// Patife
export interface PatifeHealthz {
  id: number;
  status: string;
  is_online: boolean;
  time: string;
  duration_ms: number;

  db_ok: boolean | null;
  db_latency_ms: number | null;
  db_error: string | null;

  cache_ok: boolean | null;
  cache_error: string | null;

  disk_ok: boolean | null;
  disk_free_bytes: number | null;
  disk_total_bytes: number | null;
  disk_mount: string | null;
  disk_error: string | null;

  php: string | null;
  sapi: string | null;
  env: string | null;
  app: string | null;
}

export interface PatifeHealthzResponse {
  items: PatifeHealthz[];
  meta: Pagination;
}
