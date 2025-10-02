// src/features/alerts/types.ts
import type { StatusLevel } from "@/types/global"

export type AlertItem = {
    key: string
    title: string
    status: StatusLevel | string   // tolera maiúsculas do backend
    observed_at: string
    payload?: Record<string, unknown> | null
}

export type AlertsCounts = {
    payments: number
    delayed_orders: number
    eol_products: number
    total: number
}

export type GroupedAlerts = {
    ok: boolean
    counts: AlertsCounts
    prestashop: {
        payments: AlertItem[]
        delayed_orders: AlertItem[]
        eol_products: AlertItem[]
    }
}
