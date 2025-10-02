// src/features/payments/queries.ts
import {useQuery} from "@tanstack/react-query"
import {API_PAYMENTS} from "@/lib/env"
import {http} from "@/lib/http"
import type {PaymentsResponse} from "./types"

export function usePayments() {
    return useQuery({
        queryKey: ["payments", "methods"],
        queryFn: () => http<PaymentsResponse>(`${API_PAYMENTS}`),
        refetchInterval: 30_000,
        staleTime: 25_000,
    })
}
