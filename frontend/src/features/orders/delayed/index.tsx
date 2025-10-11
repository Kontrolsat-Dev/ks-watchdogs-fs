// features/orders/delayed/index.tsx
// Página: Encomendas com Atraso (design moderno com shadcn)

import { useMemo, useState } from "react";
import { useDelayedOrders } from "./queries";
import type { DelayedOrdersResponse } from "@/api/prestashop/types";
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
import { Skeleton } from "@/components/ui/skeleton";
import LoadingDelayedOrders from "./components/loading-delayed-orders";
import LevelBadge from "./components/level-badge";
import DropshipBadge from "./components/dropship-badge";
import { RefreshCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import FlashError from "@/components/data/flash-error";
import { formatDate, timeAgo } from "@/helpers/time";

export default function OrdersDelayedPage() {
  const { data, isFetching, refetch, isError } = useDelayedOrders() as {
    data?: DelayedOrdersResponse;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // Filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "critical" | "warning" | "ok">(
    "all"
  );
  const [ds, setDs] = useState<"all" | "yes" | "no">("all");

  // Derivados
  const orders = data?.orders ?? [];

  const lastObserved = useMemo(() => {
    let max = 0;
    for (const o of orders) {
      const t = new Date(o.observed_at).getTime();
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [orders]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return orders
      .filter((o) =>
        text
          ? o.reference.toLowerCase().includes(text) ||
            String(o.id_order).includes(text) ||
            o.state_name.toLowerCase().includes(text)
          : true
      )
      .filter((o) => (status === "all" ? true : o.status === status))
      .filter((o) =>
        ds === "all" ? true : ds === "yes" ? o.dropshipping : !o.dropshipping
      )
      .sort((a, b) => b.days_passed - a.days_passed);
  }, [orders, q, status, ds]);

  // Estados de erro/loading
  if (isError) {
    return (
      <FlashError
        flashId="orders-delayed-error"
        flashTitle="Erro ao carregar encomendas"
        flashMessage="Não foi possível carregar os dados das encomendas atrasadas."
        cardTitle="Encomendas com Atraso"
        cardDescription="Não foi possível carregar os dados."
        cardButtonAction={() => refetch()}
        cardButtonText="Tentar novamente"
      />
    );
  }

  if (isFetching && (!data || (data.orders ?? []).length === 0)) {
    return <LoadingDelayedOrders />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Encomendas com Atraso
            </CardTitle>
            <CardDescription>
              Total detetado:{" "}
              <span className="font-medium text-foreground">
                {data?.count ?? "—"}
              </span>
              {lastObserved && (
                <> · Atualizado {timeAgo(lastObserved.toISOString())}</>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
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

        <CardContent className="grid gap-2 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar por referência, nº encomenda, estado…"
              className="pl-8"
              aria-label="Pesquisar encomendas atrasadas"
            />
          </div>

          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(v as "all" | "critical" | "warning" | "ok")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={ds}
            onValueChange={(v) => setDs(v as "all" | "yes" | "no")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Dropshipping" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="yes">Só Dropshipping</SelectItem>
              <SelectItem value="no">Só Loja</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-4">
          {isFetching && (!data || orders.length === 0) ? (
            // Loading inicial com skeletons
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-3">
                  {[...Array(7)].map((__, j) => (
                    <Skeleton key={j} className="h-6 w-full" />
                  ))}
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-6">
              Nenhuma encomenda encontrada com os filtros atuais.
            </div>
          ) : (
            <Table>
              <TableCaption className="text-xs">
                Listagem das encomendas sinalizadas como atrasadas.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Encomenda</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[140px]">Dropshipping</TableHead>
                  <TableHead className="w-[120px]">Dias Passados</TableHead>
                  <TableHead className="w-[100px]">Nível</TableHead>
                  <TableHead className="w-[190px]">Data de Encomenda</TableHead>
                  <TableHead className="w-[140px]">Analisado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id_order}>
                    <TableCell className="font-medium">
                      <div className="leading-tight">
                        <div className="font-mono text-xs text-muted-foreground">
                          #{o.id_order}
                        </div>
                        <div>{o.reference}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">{o.state_name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID estado: {o.id_state}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropshipBadge v={o.dropshipping} />
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "font-medium",
                          o.status === "critical" &&
                            "text-red-600 dark:text-red-400",
                          o.status === "warning" &&
                            "text-amber-600 dark:text-amber-300",
                          o.status === "ok" &&
                            "text-emerald-600 dark:text-emerald-300"
                        )}
                      >
                        {o.days_passed}d
                      </span>
                    </TableCell>

                    <TableCell>
                      <LevelBadge level={o.status} />
                    </TableCell>

                    <TableCell>{formatDate(o.date_add)}</TableCell>

                    <TableCell>
                      <span className="text-sm">{timeAgo(o.observed_at)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
