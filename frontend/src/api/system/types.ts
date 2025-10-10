export interface HealthzResponse {
    ok: boolean;
    status: string;
    service: string;
    env: string;
    now: string;
    uptime_s: number;
    db_ok: boolean;
}