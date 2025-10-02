// src/features/runs/components/ActivityList.tsx
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {StatusBadge} from "@/components/feedback/StatusBadge"
import type {RunItem} from "../types"

function formatDuration(ms: number) {
    if (ms < 1000) return `${ms} ms`
    const s = ms / 1000
    return s < 60 ? `${s.toFixed(1)} s` : `${(s / 60).toFixed(1)} min`
}

export default function ActivityList({runs}: { runs: RunItem[] }) {
    if (!runs?.length) {
        return (
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Atividade recente</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Sem atividades ainda.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Atividade recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {runs.slice(0, 10).map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{r.check_name}</div>
                            <div className="text-xs text-muted-foreground">{r.created_at}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">{formatDuration(r.duration_ms)}</span>
                            <StatusBadge status={r.status}/>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
