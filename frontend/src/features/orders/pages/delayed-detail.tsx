// src/features/orders/pages/delayed-detail.tsx
import {useParams} from "react-router-dom"
import {Separator} from "@/components/ui/separator"

export default function OrdersDelayedDetail() {
    const {id_order} = useParams()
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">Encomenda #{id_order}</h1>
                <p className="text-sm text-muted-foreground">Detalhe (a implementar)</p>
            </header>
            <Separator/>
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                Aqui vamos mostrar linhas, timeline de estados, pagamentos, tracking, etc.
            </div>
        </div>
    )
}
