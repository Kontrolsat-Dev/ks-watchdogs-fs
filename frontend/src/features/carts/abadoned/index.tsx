import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAbandonedCarts } from "./queries"; // mantém como tens
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
import {
  RefreshCcw,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
} from "lucide-react";
import { formatDate, formatHours, timeAgo } from "@/helpers/time";
import StatusPill from "./components/status-pill";
import LoadingCarts from "./components/loading-carts";
import CustomerBadge from "./components/customer-badge";
import type {
  CartAbandoned,
  CartAbandonedResponse,
} from "@/api/prestashop/types";

export default function CartsAbandonedPage() {
  const { data, isFetching, isError, refetch } = useAbandonedCarts() as {
    data?: CartAbandonedResponse & { elapsedMs?: number };
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  useEffect(() => {
    if (!isError) return;
    toast.error("Erro ao carregar carrinhos abandonados", {
      id: "abandoned-carts-error",
      description: "Não foi possível obter os carrinhos abandonados.",
    });
  }, [isError]);

  const items = (data?.items ?? []) as CartAbandoned[];

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "ok" | "warning" | "critical">(
    "all"
  );
  const [customer, setCustomer] = useState<"all" | "guest" | "registered">(
    "all"
  );

  // paginação (cliente)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(25);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // derivado: última observação e filtragem
  const lastObserved = useMemo(() => {
    let max = 0;
    for (const it of items) {
      const t = Date.parse(it.observed_at ?? "");
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [items]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return items
      .filter((it) =>
        text
          ? String(it.id_cart).includes(text) ||
            String(it.id_customer).includes(text) ||
            String(it.items).includes(text)
          : true
      )
      .filter((it) =>
        status === "all" ? true : (it.status ?? "").toLowerCase() === status
      )
      .filter((it) => {
        if (customer === "all") return true;
        const isGuest = !it.id_customer || it.id_customer === 0;
        return customer === "guest" ? isGuest : !isGuest;
      })
      .sort((a, b) => b.hours_stale - a.hours_stale || b.items - a.items);
  }, [items, q, status, customer]);

  // paginação derivada
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    setPage(1);
  }, [q, status, customer, pageSize]);
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = useMemo(
    () => filtered.slice(start, end),
    [filtered, start, end]
  );

  const isInitialLoading = isFetching && (!data || items.length === 0);
  if (isInitialLoading) return <LoadingCarts />;

  const hasFilters = q !== "" || status !== "all" || customer !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* Header & filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Carrinhos Abandonados
            </CardTitle>
            <CardDescription>
              Total filtrado:{" "}
              <span className="font-medium text-foreground">{total}</span>
              {lastObserved && (
                <> · Atualizado {timeAgo(lastObserved.toISOString())}</>
              )}
              {typeof data?.count === "number" && (
                <>
                  {" "}
                  · Total bruto:{" "}
                  <span className="font-medium">{data.count}</span>
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
                  setCustomer("all");
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

        <CardContent className="grid gap-2 md:grid-cols-4">
          {/* Pesquisa */}
          <div className="relative md:col-span-2">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar por #carrinho, #cliente ou nº itens…"
              className="pl-8"
              aria-label="Pesquisar carrinhos abandonados"
            />
          </div>

          {/* Status */}
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
            </SelectContent>
          </Select>

          {/* Tipo de cliente */}
          <Select
            value={customer}
            onValueChange={(v) => setCustomer(v as typeof customer)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="guest">Guest (id 0)</SelectItem>
              <SelectItem value="registered">Registado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Top pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          A mostrar{" "}
          <span className="font-medium text-foreground">
            {total === 0 ? 0 : start + 1}
          </span>
          –<span className="font-medium text-foreground">{end}</span> de{" "}
          <span className="font-medium text-foreground">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v) as 10 | 25 | 50)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / página</SelectItem>
              <SelectItem value="25">25 / página</SelectItem>
              <SelectItem value="50">50 / página</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                scrollTop();
              }}
              disabled={page <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[4.5rem] text-center text-sm">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                scrollTop();
              }}
              disabled={page >= totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-4">
          {pageItems.length === 0 ? (
            <div className="text-sm text-muted-foreground p-6">
              Nenhum carrinho encontrado com os filtros atuais.
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="relative overflow-auto subtle-scroll"
            >
              <Table>
                <TableCaption className="text-xs">
                  Listagem de carrinhos sinalizados como abandonados.
                </TableCaption>

                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-[260px]">Carrinho</TableHead>
                    <TableHead className="w-[160px]">Cliente</TableHead>
                    <TableHead className="w-[100px]">Itens</TableHead>
                    <TableHead className="w-[160px]">Horas (≈ dias)</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[200px]">Observado</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pageItems.map((c) => (
                    <TableRow key={c.id_cart}>
                      {/* Carrinho */}
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="leading-tight">
                            <div className="font-medium">Carrinho</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1 font-mono">
                                <Hash className="h-3.5 w-3.5" /> {c.id_cart}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cliente */}
                      <TableCell>
                        <CustomerBadge id={c.id_customer} />
                      </TableCell>

                      {/* Itens */}
                      <TableCell>
                        <span className="font-medium">{c.items}</span>
                      </TableCell>

                      {/* Horas */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatHours(c.hours_stale)}
                          </span>
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusPill value={c.status} />
                      </TableCell>

                      {/* Observado */}
                      <TableCell>
                        <div>{formatDate(c.observed_at)}</div>
                        <div className="text-xs text-muted-foreground">
                          {timeAgo(c.observed_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          A mostrar{" "}
          <span className="font-medium text-foreground">
            {total === 0 ? 0 : start + 1}
          </span>
          –<span className="font-medium text-foreground">{end}</span> de{" "}
          <span className="font-medium text-foreground">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v) as 10 | 25 | 50);
              scrollTop();
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / página</SelectItem>
              <SelectItem value="25">25 / página</SelectItem>
              <SelectItem value="50">50 / página</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                scrollTop();
              }}
              disabled={page <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[4.5rem] text-center text-sm">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                scrollTop();
              }}
              disabled={page >= totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
