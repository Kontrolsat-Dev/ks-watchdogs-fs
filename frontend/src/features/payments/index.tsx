// src/features/payments/index.tsx
import { useEffect, useMemo, useState } from "react";
import type { PaymentsResponse, PaymentMethod } from "@/api/prestashop/types";
import { usePayments } from "./queries";
import LoadingPayments from "./components/loading-payments";

// UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  RefreshCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  CircleHelp,
  CreditCard,
} from "lucide-react";
import { formatDate, timeAgo } from "@/helpers/time";
import FlashError from "@/components/data/flash-error";

// ----------------- components -----------------
function StatusBadge({ status }: { status: string }) {
  const k = (status ?? "").toLowerCase();
  const map: Record<
    string,
    { label: string; className: string; Icon: React.ElementType }
  > = {
    ok: {
      label: "OK",
      className:
        "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
      Icon: CheckCircle2,
    },
    warning: {
      label: "Aviso",
      className:
        "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
      Icon: CircleHelp,
    },
    critical: {
      label: "Crítico",
      className:
        "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
      Icon: AlertTriangle,
    },
  };
  const x = map[k] ?? map.warning;
  const Ico = x.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        x.className
      )}
    >
      <Ico className="h-3.5 w-3.5" />
      {x.label}
    </span>
  );
}

// ----------------- page -----------------
export default function PaymentsPage() {
  const { data, isFetching, isError, refetch } = usePayments() as {
    data?: PaymentsResponse;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isError) {
    return (
      <FlashError
        flashId="payments-error"
        flashTitle="Erro ao carregar métodos de pagamento"
        flashMessage="Não foi possível carregar os métodos de pagamento."
        cardTitle="Métodos de Pagamento"
        cardDescription="Não foi possível carregar os métodos de pagamento."
        cardButtonAction={() => refetch()}
        cardButtonText="Tentar novamente"
      />
    );
  }

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "ok" | "warning" | "critical">(
    "all"
  );

  // dados
  const methods: PaymentMethod[] = data?.methods ?? [];

  const lastObserved = useMemo(() => {
    let max = 0;
    for (const m of methods) {
      const t = Date.parse(m.observed_at ?? "");
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [methods]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (
      methods
        .filter((m) => (text ? m.method.toLowerCase().includes(text) : true))
        .filter((m) =>
          status === "all" ? true : m.status?.toLowerCase() === status
        )
        // mais “recentes” primeiro
        .sort((a, b) => {
          const ta = Date.parse(a.last_payment_at ?? "");
          const tb = Date.parse(b.last_payment_at ?? "");
          return (tb || 0) - (ta || 0);
        })
    );
  }, [methods, q, status]);

  const total = data?.count ?? methods.length;
  const hasFilters = q !== "" || status !== "all";
  const isInitialLoading = isFetching && (!data || methods.length === 0);

  if (isInitialLoading) return <LoadingPayments />;

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Métodos de Pagamento
            </CardTitle>
            <CardDescription>
              Total detetado:{" "}
              <span className="font-medium text-foreground">{total}</span>
              {lastObserved && (
                <> · Atualizado {timeAgo(lastObserved.toISOString())}</>
              )}
              {hasFilters && (
                <>
                  {" · "}Filtrados:{" "}
                  <span className="font-medium">{filtered.length}</span>
                </>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                }}
              >
                Limpar filtros
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className={cn(isFetching && "opacity-80")}
            >
              <RefreshCcw
                className={cn(
                  "h-4 w-4",
                  isFetching && "animate-spin [animation-duration:1.1s]"
                )}
              />
              <span className="sr-only">Recarregar</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-2 md:grid-cols-2">
          {/* Pesquisa */}
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar por método (ex.: MB Way, Visa, PayPal)…"
              className="pl-8"
              aria-label="Pesquisar métodos de pagamento"
            />
          </div>

          {/* Status */}
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(v as "all" | "ok" | "warning" | "critical")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-4">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-6">
              Nenhum método encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="relative overflow-auto subtle-scroll">
              <Table>
                <TableCaption className="text-xs">
                  Estado dos métodos de pagamento monitorizados.
                </TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-[260px]">Método</TableHead>
                    <TableHead className="w-[120px]">Estado</TableHead>
                    <TableHead className="w-[220px]">
                      Último Pagamento
                    </TableHead>
                    <TableHead className="w-[160px]">Atualizado</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.method}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{m.method}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={m.status} />
                      </TableCell>

                      <TableCell>{formatDate(m.last_payment_at)}</TableCell>

                      <TableCell>
                        <span className="text-sm">
                          {timeAgo(m.observed_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
