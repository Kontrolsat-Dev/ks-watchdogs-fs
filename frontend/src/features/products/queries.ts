// src/features/products/queries.ts
import {useQuery} from "@tanstack/react-query"
import {API_PRODUCTS_EOL} from "@/lib/env"
import {http} from "@/lib/http"
import type {EolProductsResponse} from "./types"

export function useEolProducts() {
    return useQuery({
        queryKey: ["products", "eol"],
        queryFn: () => http<EolProductsResponse>(API_PRODUCTS_EOL),
        refetchInterval: 60_000,
        staleTime: 45_000,
    })
}
