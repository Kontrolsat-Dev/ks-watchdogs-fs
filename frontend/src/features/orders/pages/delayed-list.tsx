// src/features/orders/pages/delayed-list.tsx
import {useDelayedOrders} from "../queries"
import DelayedOrdersTable from "../components/DelayedOrdersTable"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"

export default function OrdersDelayedList() {
    const {data, isLoading, isError, refetch} = useDelayedOrders()

    return (
        <div className="space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Encomendas atrasadas</h1>
                    <p className="text-sm text-muted-foreground">
                        Listagem de encomendas com atraso por estado
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        Atualizar
                    </Button>
                </div>
            </header>

            <Separator/>

            {isError ? (
                <div className="rounded-2xl border p-6 text-sm text-red-600">
                    Erro a carregar encomendas.
                </div>
            ) : (
                <DelayedOrdersTable items={data?.orders ?? []}/>
            )}
        </div>
    )
}
