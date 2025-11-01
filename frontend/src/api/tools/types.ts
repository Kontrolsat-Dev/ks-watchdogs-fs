export interface Pagination {
  page: number;
  page_size: number;
  total: 12;
  has_next: boolean;
  has_prev: boolean;
}

export interface PdaReport {
  id: number;
  code: string;
  context_json: string;
  error_text: string;
  stack_text: string;
  log_mode: string;
  ts_client: string;
  state: string;
  date_added: string;
  date_updated: string;
}

export interface PdaReportsResponse {
  items: PdaReport[];
  meta: Pagination[];
}
