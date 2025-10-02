// src/features/products/types.ts
import type {StatusLevel} from "@/types/global"

export type EolProductItem = {
    id_product: number
    name: string
    reference: string
    ean13: string
    upc: string
    price: number
    last_in_stock_at: string | null
    days_since: number
    status: StatusLevel | string
    observed_at: string
}

export type EolProductsResponse = {
    ok: boolean
    count: number
    counts: { warning: number; critical: number; ok: number; total: number }
    items: EolProductItem[]
}
