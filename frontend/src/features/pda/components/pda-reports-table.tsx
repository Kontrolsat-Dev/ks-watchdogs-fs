import type { PdaReport } from "@/api/tools/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hash, FileText, AlertCircle } from "lucide-react";
import { formatDate, timeAgo } from "@/helpers/time";
import StateBadge from "./state-badge";

interface PdaReportsTableProps {
  reports: PdaReport[];
}

export default function PdaReportsTable({ reports }: PdaReportsTableProps) {
  if (reports.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-6">
        Nenhum relatório encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="relative overflow-auto subtle-scroll">
      <Table>
        <TableCaption className="text-xs">
          Relatórios PDA monitorizados.
        </TableCaption>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead className="w-[200px]">Código</TableHead>
            <TableHead className="w-[120px]">Estado</TableHead>
            <TableHead className="w-[120px]">Modo</TableHead>
            <TableHead className="w-[180px]">Data Criado</TableHead>
            <TableHead className="w-[180px]">Data Atualizado</TableHead>
            <TableHead>Erro</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reports.map((r) => {
            const errorShort =
              r.error_text && r.error_text.length > 100
                ? `${r.error_text.slice(0, 100)}…`
                : r.error_text || "—";
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="inline-flex items-center gap-1 font-mono text-xs">
                    <Hash className="h-3.5 w-3.5" /> {r.id}
                  </span>
                </TableCell>

                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{r.code || "—"}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <StateBadge state={r.state} />
                </TableCell>

                <TableCell>
                  <span className="text-sm">{r.log_mode || "—"}</span>
                </TableCell>

                <TableCell>
                  <div>{formatDate(r.date_added)}</div>
                  <div className="text-xs text-muted-foreground">
                    {timeAgo(r.date_added)}
                  </div>
                </TableCell>

                <TableCell>
                  <div>{formatDate(r.date_updated)}</div>
                  <div className="text-xs text-muted-foreground">
                    {timeAgo(r.date_updated)}
                  </div>
                </TableCell>

                <TableCell title={r.error_text || ""}>
                  {r.error_text ? (
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {errorShort}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

