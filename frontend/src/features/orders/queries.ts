// src/features/orders/queries.ts
import { useQuery } from "@tanstack/react-query"
import { API_ORDERS } from "@/lib/env"
import { http } from "@/lib/http"
import type { DelayedOrdersResponse } from "./types"

export function useDelayedOrders() {
    return useQuery({
        queryKey: ["orders", "delayed"],
        queryFn: () => http<DelayedOrdersResponse>(`${API_ORDERS}`),
        refetchInterval: 30_000,
        staleTime: 25_000,
    })
}
