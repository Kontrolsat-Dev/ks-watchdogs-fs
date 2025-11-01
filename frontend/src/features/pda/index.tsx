import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePdaReports } from "./queries";
import type {
  PdaReportsResponse,
  PdaReport,
  Pagination,
} from "@/api/tools/types";
import LoadingReports from "./components/loading-reports";
import PdaReportsTable from "./components/pda-reports-table";
import PaginationControls from "./components/pagination-controls";

// UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { RefreshCcw, Search } from "lucide-react";
import { timeAgo } from "@/helpers/time";
import FlashError from "@/components/data/flash-error";

// ----------------- page -----------------
export default function PdaPage() {
  // Paginação servidor
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(25);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const { data, isFetching, isError, refetch } = usePdaReports({
    page,
    page_size: pageSize,
  }) as {
    data?: PdaReportsResponse & { elapsedMs?: number };
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isError) {
    return (
      <FlashError
        flashId="pda-reports-error"
        flashTitle="Erro ao carregar relatórios PDA"
        flashMessage="Não foi possível carregar os relatórios PDA."
        cardTitle="Relatórios PDA"
        cardDescription="Não foi possível carregar os relatórios PDA."
        cardButtonAction={() => refetch()}
        cardButtonText="Tentar novamente"
      />
    );
  }

  // Filtros
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | string>("all");
  const [logModeFilter, setLogModeFilter] = useState<"all" | string>("all");

  // Dados
  const reports: PdaReport[] = data?.items ?? [];
  const meta: Pagination | null = Array.isArray(data?.meta)
    ? data?.meta[0] ?? null
    : data?.meta ?? null;

  // Última atualização
  const lastUpdated = useMemo(() => {
    let max = 0;
    for (const r of reports) {
      const t = Date.parse(r.date_updated ?? "");
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [reports]);

  // Filtragem local (client-side)
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return reports
      .filter((r) =>
        text
          ? r.code?.toLowerCase().includes(text) ||
            String(r.id).includes(text) ||
            r.error_text?.toLowerCase().includes(text)
          : true
      )
      .filter((r) =>
        stateFilter === "all"
          ? true
          : (r.state ?? "").toLowerCase() === stateFilter.toLowerCase()
      )
      .filter((r) =>
        logModeFilter === "all"
          ? true
          : (r.log_mode ?? "").toLowerCase() === logModeFilter.toLowerCase()
      )
      .sort((a, b) => Date.parse(b.date_updated) - Date.parse(a.date_updated));
  }, [reports, q, stateFilter, logModeFilter]);

  // Estados únicos para filtros
  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    for (const r of reports) {
      if (r.state) set.add(r.state.toLowerCase());
    }
    return Array.from(set).sort();
  }, [reports]);

  const uniqueLogModes = useMemo(() => {
    const set = new Set<string>();
    for (const r of reports) {
      if (r.log_mode) set.add(r.log_mode.toLowerCase());
    }
    return Array.from(set).sort();
  }, [reports]);

  const total = meta?.total ?? filtered.length;
  const hasFilters =
    q !== "" || stateFilter !== "all" || logModeFilter !== "all";
  const isInitialLoading = isFetching && (!data || reports.length === 0);

  if (isInitialLoading) return <LoadingReports />;

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Relatórios PDA
            </CardTitle>
            <CardDescription>
              Total:{" "}
              <span className="font-medium text-foreground">{total}</span>
              {lastUpdated && (
                <> · Última atualização {timeAgo(lastUpdated.toISOString())}</>
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
                  setStateFilter("all");
                  setLogModeFilter("all");
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

        <CardContent className="grid gap-2 grid-cols-4">
          {/* Pesquisa */}
          <div className="relative md:col-span-2">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar por código, ID ou erro…"
              className="pl-8"
              aria-label="Pesquisar relatórios"
            />
          </div>

          {/* Estado */}
          <Select value={stateFilter} onValueChange={(v) => setStateFilter(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {uniqueStates.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Modo de Log */}
          <Select
            value={logModeFilter}
            onValueChange={(v) => setLogModeFilter(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Modo de Log" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os modos</SelectItem>
              {uniqueLogModes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Top pagination */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        meta={meta}
        currentItemsCount={reports.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onScrollTop={scrollTop}
      />

      {/* Tabela */}
      <Card>
        <CardContent className="pt-4">
          <div ref={scrollRef}>
            <PdaReportsTable reports={filtered} />
          </div>
        </CardContent>
      </Card>

      {/* Bottom pagination */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        meta={meta}
        currentItemsCount={reports.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onScrollTop={scrollTop}
      />
    </div>
  );
}
