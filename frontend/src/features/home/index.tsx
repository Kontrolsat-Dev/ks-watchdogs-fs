// src/features/home/index.tsx
import {Suspense, useMemo} from "react"
import StatCard from "@/components/data/StatCard"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {paths} from "@/lib/paths"
import {useNavigate} from "react-router-dom"
import {CreditCard, ClockAlert, PackageX} from "lucide-react"
import {useAlerts} from "@/features/alerts/queries"
import AlertsList from "@/features/alerts/components/AlertsList"
import ActivityList from "@/features/runs/components/ActivityList.tsx";
import {useRuns} from "@/features/runs/queries.ts";

export default function HomePage() {
    const nav = useNavigate()
    const {data, isLoading, refetch, isError} = useAlerts()

    const counts = data?.counts ?? {payments: 0, delayed_orders: 0, eol_products: 0, total: 0}

    const mergedAlerts = useMemo(() => {
        const all = [
            ...(data?.prestashop?.payments ?? []),
            ...(data?.prestashop?.delayed_orders ?? []),
            ...(data?.prestashop?.eol_products ?? []),
        ]
        // se no futuro vier com timestamp real, podemos ordenar; para já mantemos a ordem
        return all.slice(0, 6)
    }, [data])

    const runsQ = useRuns({limit: 6, status: "all"})

    return (
        <div className="space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Watchdogs - Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Resumo rápido do estado atual
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        Atualizar
                    </Button>
                </div>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Pagamentos - problemas"
                    value={counts.payments}
                    description="métodos com atraso"
                    icon={<CreditCard className="h-4 w-4 text-muted-foreground"/>}
                    onClick={() => nav(paths.payments)}
                />
                <StatCard
                    title="Encomendas atrasadas"
                    value={counts.delayed_orders}
                    description="encomendas por resolver"
                    icon={<ClockAlert className="h-4 w-4 text-muted-foreground"/>}
                    onClick={() => nav(paths.orders.delayedList)}
                />
                <StatCard
                    title="Produtos EOL"
                    value={counts.eol_products}
                    description="produtos sem stock prolongado"
                    icon={<PackageX className="h-4 w-4 text-muted-foreground"/>}
                    onClick={() => nav(paths.products.eolList)}
                />
            </section>

            <Separator/>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                    <AlertsList items={mergedAlerts}/>
                </div>

                <div className="space-y-2">
                    {runsQ.isError ? (
                        <div className="rounded-2xl border p-6 text-sm text-red-600">
                            Erro ao carregar atividade.
                        </div>
                    ) : (
                        <ActivityList runs={runsQ.data?.runs ?? []}/>
                    )}
                </div>
            </section>

            <Suspense fallback={null}/>
            {isError && (
                <div className="text-sm text-red-600">
                    Não foi possível carregar os alertas.
                </div>
            )}
        </div>
    )
}
