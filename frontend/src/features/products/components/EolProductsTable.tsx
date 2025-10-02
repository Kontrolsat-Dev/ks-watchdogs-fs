// src/features/products/components/EolProductsTable.tsx
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {StatusBadge} from "@/components/feedback/StatusBadge"
import type {EolProductItem} from "../types"

function fmtDate(s: string | null) {
    if (!s) return "Nunca"
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : d.toLocaleDateString()
}

function fmtPrice(n: number) {
    try {
        return new Intl.NumberFormat("pt-PT", {style: "currency", currency: "EUR"}).format(n)
    } catch {
        return `${n} €`
    }
}

export default function EolProductsTable({items}: { items: EolProductItem[] }) {
    if (!items?.length) {
        return (
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                Sem produtos EOL para mostrar.
            </div>
        )
    }

    return (
        <div className="rounded-2xl border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden lg:table-cell">Ref.</TableHead>
                        <TableHead className="hidden xl:table-cell">EAN</TableHead>
                        <TableHead className="hidden md:table-cell">Último stock</TableHead>
                        <TableHead>Dias s/ stock</TableHead>
                        <TableHead className="hidden md:table-cell">Preço</TableHead>
                        <TableHead className="w-[1%] text-right">Sev.</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((p) => {
                        const status = String(p.status).toLowerCase()
                        return (
                            <TableRow key={p.id_product}>
                                <TableCell className="font-mono text-xs">{p.id_product}</TableCell>
                                <TableCell className="max-w-[440px]">
                                    <div className="font-medium truncate">{p.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{p.reference}</div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">{p.reference}</TableCell>
                                <TableCell className="hidden xl:table-cell">{p.ean13 || "—"}</TableCell>
                                <TableCell
                                    className="hidden md:table-cell text-muted-foreground">{fmtDate(p.last_in_stock_at)}</TableCell>
                                <TableCell>{p.days_since}</TableCell>
                                <TableCell className="hidden md:table-cell">{fmtPrice(p.price)}</TableCell>
                                <TableCell className="text-right"><StatusBadge status={status}/></TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
