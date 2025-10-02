// src/features/runs/queries.ts
import { useQuery } from "@tanstack/react-query"
import { API_RUNS } from "@/lib/env"
import { http } from "@/lib/http"
import type { RunsResponse, RunStatus } from "./types"

export function useRuns(params?: { limit?: number; status?: RunStatus }) {
    const limit = params?.limit ?? 100
    const status = params?.status ?? "all"
    const url = `${API_RUNS}?limit=${limit}&status=${status}`
    return useQuery({
        queryKey: ["runs", { limit, status }],
        queryFn: () => http<RunsResponse>(url),
        refetchInterval: 30_000,
        staleTime: 25_000,
    })
}
