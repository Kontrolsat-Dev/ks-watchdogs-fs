// src/features/payments/components/PaymentsTable.tsx
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {StatusBadge} from "@/components/feedback/StatusBadge"
import type {PaymentMethodItem} from "../types"

function fmtHours(h: number | null) {
    if (h == null) return "—"
    if (h < 1) return `${Math.round(h * 60)} min`
    return `${h.toFixed(1)} h`
}

export default function PaymentsTable({items}: { items: PaymentMethodItem[] }) {
    if (!items?.length) {
        return (
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                Sem métodos de pagamento para mostrar.
            </div>
        )
    }

    return (
        <div className="rounded-2xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Método</TableHead>
                        <TableHead className="hidden md:table-cell">Último pagamento</TableHead>
                        <TableHead>Horas desde último</TableHead>
                        <TableHead className="w-[1%] text-right">Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((m) => {
                        const status = String(m.status).toLowerCase()
                        return (
                            <TableRow key={m.method}>
                                <TableCell className="font-medium">{m.method}</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                    {m.last_payment_at ?? "—"}
                                </TableCell>
                                <TableCell>{fmtHours(m.hours_since_last)}</TableCell>
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
