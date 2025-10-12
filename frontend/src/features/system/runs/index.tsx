import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSystemRuns } from "./queries"; // vê ficheiro abaixo
import type { RunsReponse, Run } from "@/api/system/types";
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
  Info,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate, timeAgo } from "@/helpers/time";
import LoadingRuns from "./components/loading-runs";
import StatusPill from "./components/status-pill";

/* ---------- Page ---------- */
export default function SystemRunsPage() {
  const { data, isFetching, isError, refetch } = useSystemRuns() as {
    data?: RunsReponse & { elapsedMs?: number };
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  useEffect(() => {
    if (!isError) return;
    toast.error("Erro ao carregar execuções do sistema", {
      id: "system-runs-error",
      description: "Não foi possível obter o histórico recente do worker.",
    });
  }, [isError]);

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<
    "all" | "ok" | "warning" | "critical" | "error" | "running" | "queued"
  >("all");

  // paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(25);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const runs: Run[] = data?.runs ?? [];

  const lastCreated = useMemo(() => {
    let max = 0;
    for (const r of runs) {
      const t = Date.parse(r.created_at ?? "");
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [runs]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return runs
      .filter((r) =>
        text
          ? r.check_name.toLowerCase().includes(text) ||
            String(r.id).includes(text) ||
            (r.payload?.error ?? "").toLowerCase().includes(text)
          : true
      )
      .filter((r) =>
        status === "all" ? true : (r.status ?? "").toLowerCase() === status
      )
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  }, [runs, q, status]);

  // paginação derivada
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    setPage(1);
  }, [q, status, pageSize]);
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = useMemo(
    () => filtered.slice(start, end),
    [filtered, start, end]
  );

  const isInitialLoading = isFetching && (!data || runs.length === 0);
  if (isInitialLoading) return <LoadingRuns />;

  return (
    <div className="flex flex-col gap-4">
      {/* Header & filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">System Runs</CardTitle>
            <CardDescription>
              Total:{" "}
              <span className="font-medium text-foreground">{total}</span>
              {lastCreated && (
                <> · Última atualização {timeAgo(lastCreated.toISOString())}</>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {(q || status !== "all") && (
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

        <CardContent className="grid gap-2 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar por check, ID ou erro…"
              className="pl-8"
              aria-label="Pesquisar runs"
            />
          </div>

          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="running">A correr</SelectItem>
              <SelectItem value="queued">Em fila</SelectItem>
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
              Nenhuma execução encontrada com os filtros atuais.
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="relative overflow-auto subtle-scroll"
            >
              <Table>
                <TableCaption className="text-xs">
                  Histórico recente de execuções do worker.
                </TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-[320px]">Check</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                    <TableHead className="w-[140px]">Raw / Unique</TableHead>
                    <TableHead>Erro</TableHead>
                    <TableHead className="w-[180px]">Criado</TableHead>
                    <TableHead className="w-[120px]">ID</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pageItems.map((r) => {
                    const raw = r.payload?.count_raw ?? "—";
                    const uniq = r.payload?.count_unique ?? "—";
                    const err = r.payload?.error?.trim() || "";
                    const errShort =
                      err.length > 120 ? `${err.slice(0, 120)}…` : err || "—";
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="leading-tight">
                              <div className="font-medium">{r.check_name}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <StatusPill value={r.status} />
                        </TableCell>

                        <TableCell>
                          <span className="font-medium">{raw}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {uniq}
                          </span>
                        </TableCell>

                        <TableCell title={err}>{errShort}</TableCell>

                        <TableCell>
                          <div>{formatDate(r.created_at)}</div>
                          <div className="text-xs text-muted-foreground">
                            {timeAgo(r.created_at)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center gap-1 font-mono text-xs">
                            <Hash className="h-3.5 w-3.5" /> {r.id}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
