// src/features/orders/types.ts
import type {StatusLevel} from "@/types/global"

export type DelayedOrderItem = {
    id_order: number
    reference: string
    date_add: string
    days_passed: number
    id_state: number
    state_name: string
    dropshipping: boolean
    status: StatusLevel | string
    observed_at: string
}

export type DelayedOrdersResponse = {
    ok: boolean
    count: number
    orders: DelayedOrderItem[]
}
