// src/layout/Topbar.tsx
import { useHealthz } from "@/features/system/queries"
import { StatusDot } from "@/components/feedback/StatusDot"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCcw } from "lucide-react"

export default function Topbar() {
    const { data, isFetching, refetch, isError } = useHealthz()

    const status =
        isError ? "critical"
            : !data ? "warning"
                : data.status?.toLowerCase()

    const latencyMs = data?.elapsedMs ? Math.round(data.elapsedMs) : null

    return (
        <div className="sticky top-0 z-10 mb-4 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
            <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">Watchdogs</div>
                    <span className="text-xs text-muted-foreground">Sistema de Monitorização de Ecommerce</span>
                </div>

                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                            status === "ok" && "border-emerald-200",
                            status !== "ok" && "border-amber-200"
                        )}
                        title={isError ? "Erro ao verificar saúde do backend" : "Estado do backend"}
                    >
                        <StatusDot status={status || "warning"} />
                        <span className="hidden sm:inline">
              {isError ? "Backend: erro" : `Backend: ${data?.status ?? "…"}`}
            </span>
                        {data?.env && <span className="text-muted-foreground">· {data.env}</span>}
                        {typeof data?.db_ok === "boolean" && (
                            <span className={cn("ml-1", data.db_ok ? "text-emerald-600" : "text-red-600")}>
                DB {data.db_ok ? "ok" : "down"}
              </span>
                        )}
                        {latencyMs !== null && <span className="text-muted-foreground">· {latencyMs}ms</span>}
                        {isFetching && <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" />}
                    </div>

                    <Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Atualizar estado">
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
