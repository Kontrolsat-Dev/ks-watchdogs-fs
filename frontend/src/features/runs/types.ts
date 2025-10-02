// src/features/runs/types.ts
export type RunStatus = "ok" | "error" | "all"

export type RunItem = {
    id: number
    check_name: string
    status: "ok" | "error" | string
    duration_ms: number
    payload?: Record<string, unknown>
    created_at: string
}

export type RunsResponse = {
    ok: boolean
    count: number
    runs: RunItem[]
}
