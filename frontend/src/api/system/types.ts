export interface HealthzResponse {
  ok: boolean;
  status: string;
  service: string;
  env: string;
  now: string;
  uptime_s: number;
  db_ok: boolean;
}

export interface RunsPayload {
  error: string | null;
  count_raw: number | null;
  count_unique: number | null;
}

export interface Run {
  id: number;
  check_name: string;
  status: string;
  payload: RunsPayload;
  created_at: string;
}

export interface RunsReponse {
  ok: boolean;
  count: number;
  runs: Run[];
}
