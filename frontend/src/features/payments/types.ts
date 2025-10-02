// src/features/payments/types.ts
import type {StatusLevel} from "@/types/global"

export type PaymentMethodItem = {
    method: string
    last_payment_at: string | null
    hours_since_last: number | null
    status: StatusLevel | string
    observed_at: string
}

export type PaymentsResponse = {
    ok: boolean
    count: number
    methods: PaymentMethodItem[]
}
