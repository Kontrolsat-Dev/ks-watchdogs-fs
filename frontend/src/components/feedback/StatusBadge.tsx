import { Badge } from "@/components/ui/badge"

const statusClasses = {
    ok: "bg-emerald-500/15 text-emerald-700",
    warning: "bg-amber-500/15 text-amber-700",
    critical: "bg-red-500/15 text-red-700",
} as const

type StatusKey = keyof typeof statusClasses

export function StatusBadge({ status }: { status: StatusKey | string }) {
    const key = (status.toLowerCase?.() as StatusKey) ?? "ok"

    const className = statusClasses[key] ?? "bg-gray-200 text-gray-700"

    return (
        <Badge className={className} variant="secondary">
            {status}
        </Badge>
    )
}
