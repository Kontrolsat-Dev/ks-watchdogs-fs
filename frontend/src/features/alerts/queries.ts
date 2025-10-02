import { useQuery } from "@tanstack/react-query"
import { API_ALERTS } from "@/lib/env"
import { http } from "@/lib/http"
import type { GroupedAlerts } from "./types"

export function useAlerts() {
    return useQuery({
        queryKey: ["alerts", "grouped"],
        queryFn: () => http<GroupedAlerts>(API_ALERTS),
        refetchInterval: 30_000,
        staleTime: 25_000,
    })
}
