// src/features/products/eol/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useProductsEol } from "./queries";
import StatusBadge from "./components/status-badge";
import LoadingProductsEol from "./components/loading-products";
import PriceBadge from "./components/price-badge";

import type {
  ProductsEolReponse,
  ProductEol,
  ProductsEolCount,
} from "@/api/prestashop/types";

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
import {
  RefreshCcw,
  Search,
  AlertTriangle,
  CircleHelp,
  Tag,
  Barcode,
  PackageX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate, timeAgo } from "@/helpers/time";
import FlashError from "@/components/data/flash-error";

function hasUPCValue(upc: unknown): boolean {
  if (upc == null) return false;

  const s = String(upc).trim();
  // vazio → sem UPC
  if (s === "") return false;

  // se for número direto
  const n = Number(s);
  if (!Number.isNaN(n)) return n > 0;

  // se vier com formatação/caracteres não numéricos: extrai dígitos
  const digits = s.replace(/\D+/g, "");
  if (digits === "") return false;

  // "0000000" → 0 (sem UPC); qq outro > 0 → com UPC
  return Number(digits) > 0;
}

/* ----------------- page ----------------- */
export default function ProductsEolPage() {
  const { data, isFetching, isError, refetch } = useProductsEol() as {
    data?: ProductsEolReponse & { elapsedMs?: number };
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isError) {
    return (
      <FlashError
        flashId="products-eol-error"
        flashTitle="Erro ao carregar produtos em fim de vida"
        flashMessage="Não foi possível carregar os produtos em fim de vida."
        cardTitle="Produtos em Fim de Vida"
        cardDescription="Não foi possível carregar os produtos em fim de vida."
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
  const [priceFilter, setPriceFilter] = useState<"all" | "with" | "without">(
    "all"
  );
  const [stockFilter, setStockFilter] = useState<"all" | "with" | "without">(
    "all"
  ); // << NOVO

  // paginação (client)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50 | 100>(25);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTop = () =>
    tableScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const items: ProductEol[] = data?.items ?? [];

  // contagens
  const counts: ProductsEolCount | null = useMemo(() => {
    if (data?.counts) return data.counts;
    if (!items.length) return null;
    return items.reduce(
      (acc, it) => {
        const k = (it.status ?? "").toLowerCase();
        if (k === "critical") acc.critical++;
        else if (k === "ok") acc.ok++;
        else acc.warning++;
        acc.total++;
        return acc;
      },
      { critical: 0, warning: 0, ok: 0, total: 0 } as ProductsEolCount
    );
  }, [data?.counts, items]);

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
          ? it.name.toLowerCase().includes(text) ||
            it.reference.toLowerCase().includes(text) ||
            (it.upc ?? "").toLowerCase().includes(text)
          : true
      )
      .filter((it) =>
        status === "all" ? true : (it.status ?? "").toLowerCase() === status
      )
      .filter((it) =>
        priceFilter === "all"
          ? true
          : priceFilter === "with"
          ? !!it.price
          : !it.price
      )
      .filter((it) => {
        if (stockFilter === "all") return true;
        const has = hasUPCValue(it.upc);
        return stockFilter === "with" ? has : !has;
      })

      .sort((a, b) => (b.days_since || 0) - (a.days_since || 0));
  }, [items, q, status, priceFilter, stockFilter]); // << inclui stockFilter

  // paginação derivada
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // reset page quando filtros/pageSize mudam
  useEffect(() => {
    setPage(1);
  }, [q, status, priceFilter, stockFilter, pageSize]); // << inclui stockFilter
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = useMemo(
    () => filtered.slice(startIdx, endIdx),
    [filtered, startIdx, endIdx]
  );

  const isInitialLoading = isFetching && (!data || items.length === 0);
  const hasFilters =
    q !== "" ||
    status !== "all" ||
    priceFilter !== "all" ||
    stockFilter !== "all";

  if (isInitialLoading) return <LoadingProductsEol />;

  return (
    <div className="flex flex-col gap-4">
      {/* Header & filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Produtos em Fim de Vida
            </CardTitle>
            <CardDescription>
              Total filtrado:{" "}
              <span className="font-medium text-foreground">{total}</span>
              {lastObserved && (
                <> · Atualizado {timeAgo(lastObserved.toISOString())}</>
              )}
              {counts && (
                <span>
                  {" · "}
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />{" "}
                    {counts.critical}
                  </span>{" "}
                  <span className="inline-flex items-center gap-1">
                    <CircleHelp className="h-3 w-3 text-amber-500" />{" "}
                    {counts.warning}
                  </span>
                </span>
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
                  setPriceFilter("all");
                  setStockFilter("all"); // << NOVO
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

        <CardContent className="grid gap-2 grid-cols-5">
          {/* Pesquisa */}
          <div className="relative md:col-span-2">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar por nome, referência, UPC…"
              className="pl-8"
              aria-label="Pesquisar produtos EOL"
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
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
            </SelectContent>
          </Select>

          {/* Preço */}
          <Select
            value={priceFilter}
            onValueChange={(v) =>
              setPriceFilter(v as "all" | "with" | "without")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Com e sem preço</SelectItem>
              <SelectItem value="with">Apenas com preço</SelectItem>
              <SelectItem value="without">Apenas sem preço</SelectItem>
            </SelectContent>
          </Select>

          {/* Stock (UPC) — NOVO */}
          <Select
            value={stockFilter}
            onValueChange={(v) =>
              setStockFilter(v as "all" | "with" | "without")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Stock (UPC)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Com e sem UPC</SelectItem>
              <SelectItem value="with">Só com UPC</SelectItem>
              <SelectItem value="without">Só sem UPC</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Controls de paginação (topo) */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          A mostrar{" "}
          <span className="font-medium text-foreground">
            {total === 0 ? 0 : startIdx + 1}
          </span>
          –<span className="font-medium text-foreground">{endIdx}</span> de{" "}
          <span className="font-medium text-foreground">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v) as 10 | 25 | 50 | 100)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / página</SelectItem>
              <SelectItem value="25">25 / página</SelectItem>
              <SelectItem value="50">50 / página</SelectItem>
              <SelectItem value="100">100 / página</SelectItem>
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
              Nenhum produto encontrado com os filtros atuais.
            </div>
          ) : (
            <div
              ref={tableScrollRef}
              className="relative overflow-auto subtle-scroll"
            >
              <Table>
                <TableCaption className="text-xs">
                  Produtos assinalados como “End of Life” (EOL).
                </TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-[420px]">Produto</TableHead>
                    <TableHead className="w-[140px]">Preço</TableHead>
                    <TableHead className="w-[140px]">Stock (UPC)</TableHead>
                    <TableHead className="w-[120px]">Dias desde</TableHead>
                    <TableHead className="w-[190px]">Último em stock</TableHead>
                    <TableHead className="w-[120px]">Nível</TableHead>
                    <TableHead className="w-[160px]">Observado</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pageItems.map((p) => (
                    <TableRow key={p.id_product}>
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-3">
                          <PackageX className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="leading-tight">
                            <div className="font-medium">{p.name}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" />{" "}
                                {p.reference || "—"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Barcode className="h-3.5 w-3.5" />{" "}
                                {p.ean13 || "—"}
                              </span>
                              <span className="inline-flex items-center gap-1 font-mono">
                                #{p.id_product}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <PriceBadge hasPrice={!!p.price} />
                      </TableCell>

                      {/* Stock (UPC) */}
                      <TableCell>{p.upc || "—"}</TableCell>

                      {/* Dias desde */}
                      <TableCell>
                        <span
                          className={cn(
                            "font-medium",
                            (p.status ?? "").toLowerCase() === "critical" &&
                              "text-red-600 dark:text-red-400",
                            (p.status ?? "").toLowerCase() === "warning" &&
                              "text-amber-600 dark:text-amber-300",
                            (p.status ?? "").toLowerCase() === "ok" &&
                              "text-emerald-600 dark:text-emerald-300"
                          )}
                        >
                          {p.days_since ?? 0}d
                        </span>
                      </TableCell>

                      {/* Último em stock */}
                      <TableCell>{formatDate(p.last_in_stock_at)}</TableCell>

                      {/* Nível */}
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>

                      {/* Observado */}
                      <TableCell>
                        <span className="text-sm">
                          {timeAgo(p.observed_at)}
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

      {/* Controls de paginação (base) */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          A mostrar{" "}
          <span className="font-medium text-foreground">
            {total === 0 ? 0 : startIdx + 1}
          </span>
          –<span className="font-medium text-foreground">{endIdx}</span> de{" "}
          <span className="font-medium text-foreground">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v) as 10 | 25 | 50 | 100);
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
              <SelectItem value="100">100 / página</SelectItem>
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
