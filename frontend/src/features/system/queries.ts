// src/features/system/queries.ts
import { useQuery } from "@tanstack/react-query"
import { HEALTH_API } from "@/lib/env"
import { http } from "@/lib/http"
import type { HealthzResponse } from "./types"

export function useHealthz() {
    return useQuery({
        queryKey: ["system", "healthz"],
        queryFn: async () => {
            const started = performance.now()
            const data = await http<HealthzResponse>(`${HEALTH_API}`)
            const elapsedMs = Math.max(0, performance.now() - started)
            return { ...data, elapsedMs }
        },
        refetchInterval: 30_000,
        staleTime: 25_000,
    })
}
