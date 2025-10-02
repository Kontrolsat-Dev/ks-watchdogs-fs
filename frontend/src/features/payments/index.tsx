// src/features/payments/index.tsx
import {usePayments} from "./queries"
import PaymentsTable from "./components/PaymentsTable"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"

export default function PaymentsPage() {
    const {data, isLoading, isError, refetch} = usePayments()

    return (
        <div className="space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Pagamentos</h1>
                    <p className="text-sm text-muted-foreground">
                        Estado dos métodos de pagamento e atividade recente
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
                    Erro a carregar os métodos de pagamento.
                </div>
            ) : (
                <PaymentsTable items={data?.methods ?? []}/>
            )}
        </div>
    )
}
