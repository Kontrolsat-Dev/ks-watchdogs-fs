// src/features/alerts/components/AlertsList.tsx
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {StatusBadge} from "@/components/feedback/StatusBadge"
import type {AlertItem} from "../types"

export default function AlertsList({items}: { items: AlertItem[] }) {
    if (!items?.length) {
        return (
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                Sem alertas.
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Últimos alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map((a) => {
                    const status = String(a.status).toLowerCase() as any
                    return (
                        <div key={a.key} className="flex items-start gap-3">
                            <StatusBadge status={status}/>
                            <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{a.title}</div>
                                <div className="text-xs text-muted-foreground">{a.observed_at}</div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
