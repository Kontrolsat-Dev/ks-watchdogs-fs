// src/features/products/pages/eol-list.tsx
import {useEolProducts} from "../queries"
import EolProductsTable from "../components/EolProductsTable"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {Badge} from "@/components/ui/badge"

export default function ProductsEolList() {
    const {data, isLoading, isError, refetch} = useEolProducts()
    const counts = data?.counts ?? {warning: 0, critical: 0, ok: 0, total: 0}

    return (
        <div className="space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Produtos EOL</h1>
                    <p className="text-sm text-muted-foreground">
                        Produtos ativos sem stock prolongado (EOL)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        Atualizar
                    </Button>
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-red-500/15 text-red-700">critical: {counts.critical}</Badge>
                <Badge className="bg-amber-500/15 text-amber-700">warning: {counts.warning}</Badge>
                <Badge variant="secondary">total: {counts.total}</Badge>
            </div>

            <Separator/>

            {isError ? (
                <div className="rounded-2xl border p-6 text-sm text-red-600">
                    Erro a carregar produtos EOL.
                </div>
            ) : (
                <EolProductsTable items={data?.items ?? []}/>
            )}
        </div>
    )
}
