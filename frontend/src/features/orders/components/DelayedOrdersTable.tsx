// src/features/orders/components/DelayedOrdersTable.tsx
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {StatusBadge} from "@/components/feedback/StatusBadge"
import type {DelayedOrderItem} from "../types"
import {useNavigate} from "react-router-dom"
import {paths} from "@/lib/paths"

function fmtDate(s: string) {
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : d.toLocaleString()
}

export default function DelayedOrdersTable({items}: { items: DelayedOrderItem[] }) {
    const nav = useNavigate()

    if (!items?.length) {
        return (
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                Sem encomendas atrasadas.
            </div>
        )
    }

    return (
        <div className="rounded-2xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead className="hidden xl:table-cell">Data</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Drop</TableHead>
                        <TableHead className="w-[1%] text-right">Sev.</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((o) => {
                        const status = String(o.status).toLowerCase()
                        return (
                            <TableRow
                                key={o.id_order}
                                className="cursor-pointer hover:bg-accent/40"
                                onClick={() => nav(paths.orders.delayedDetail(o.id_order))}
                            >
                                <TableCell className="font-medium">{o.reference}</TableCell>
                                <TableCell className="hidden xl:table-cell text-muted-foreground">
                                    {fmtDate(o.date_add)}
                                </TableCell>
                                <TableCell>{o.days_passed}</TableCell>
                                <TableCell>{o.state_name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={o.dropshipping ? "" : "opacity-60"}>
                                        {o.dropshipping ? "Sim" : "Não"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <StatusBadge status={status}/>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
