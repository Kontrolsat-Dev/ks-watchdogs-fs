// src/features/system/types.ts
export type HealthzResponse = {
    ok: boolean
    status: "ok" | "degraded" | "down" | string
    service: string
    env: string
    now: string
    uptime_s: number | null
    db_ok: boolean
}
