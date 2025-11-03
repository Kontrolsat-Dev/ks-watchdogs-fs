import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/helpers/time";
import FlashError from "@/components/data/flash-error";
import { usePatifeHealthz } from "./queries";
import type {
  Pagination,
  PatifeHealthz,
  PatifeHealthzResponse,
} from "@/api/tools/types";

// UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationControls from "@/features/pda/components/pagination-controls";
import {
  Activity,
  Database,
  HardDrive,
  RefreshCcw,
  Server,
} from "lucide-react";

export default function PatifeHealthzPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(25);
  const [q, setQ] = useState("");
  const [onlineFilter, setOnlineFilter] = useState<
    "all" | "online" | "offline"
  >("all");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const { data, isFetching, isError, refetch } = usePatifeHealthz({
    page,
    page_size: pageSize,
  }) as {
    data?: PatifeHealthzResponse & { elapsedMs?: number };
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  console.log(data);

  if (isError) {
    return (
      <FlashError
        flashId="patife-healthz-error"
        flashTitle="Erro ao carregar estado do Patife"
        flashMessage="Não foi possível obter o estado atual."
        cardTitle="Patife · Health"
        cardDescription="Falha ao carregar informação do serviço."
        cardButtonAction={() => refetch()}
        cardButtonText="Tentar novamente"
      />
    );
  }

  const items: PatifeHealthz[] = data?.items ?? [];
  const meta: Pagination | null = Array.isArray(data?.meta)
    ? data?.meta[0] ?? null
    : data?.meta ?? null;

  const total = meta?.total ?? items.length;
  const lastTime = useMemo(() => {
    let max = 0;
    for (const it of items) {
      const t = Date.parse(it.time ?? "");
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [items]);

  const filtered = useMemo(() => {
    const txt = q.trim().toLowerCase();
    return items
      .filter((i) =>
        onlineFilter === "all"
          ? true
          : onlineFilter === "online"
          ? i.is_online
          : !i.is_online
      )
      .filter((i) =>
        txt
          ? (i.status || "").toLowerCase().includes(txt) ||
            (i.app || "").toLowerCase().includes(txt) ||
            (i.env || "").toLowerCase().includes(txt) ||
            String(i.id).includes(txt)
          : true
      )
      .sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
  }, [items, q, onlineFilter]);

  const isInitialLoading = isFetching && (!data || items.length === 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Patife · Health
            </CardTitle>
            <CardDescription>
              Total:{" "}
              <span className="font-medium text-foreground">{total}</span>
              {lastTime && (
                <> · Última leitura {timeAgo(lastTime.toISOString())}</>
              )}
              {typeof data?.elapsedMs === "number" && (
                <> · {Math.round(data.elapsedMs)}ms</>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {(q !== "" || onlineFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ("");
                  setOnlineFilter("all");
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
          <div className="md:col-span-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar por status, app, env…"
              aria-label="Pesquisar registos"
            />
          </div>

          {/* Estado online/offline */}
          <Select
            value={onlineFilter}
            onValueChange={(v) => setOnlineFilter(v as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Top pagination */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        meta={meta}
        currentItemsCount={items.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onScrollTop={scrollTop}
      />

      {/* Lista */}
      <Card>
        <CardContent className="pt-4">
          <div ref={scrollRef} className="space-y-2">
            {isInitialLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-md border bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6">
                Sem registos para mostrar.
              </div>
            ) : (
              <div className="space-y-2">
                {/* header */}
                <div className="grid grid-cols-12 gap-3 px-2 py-1.5 text-xs text-muted-foreground">
                  <div className="col-span-3">Serviço</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-3">Infra</div>
                  <div className="col-span-2">Ambiente</div>
                  <div className="col-span-2">Hora</div>
                </div>

                {filtered.map((h) => (
                  <div
                    key={h.id}
                    className="grid grid-cols-12 gap-3 items-center rounded-md border px-2 py-2"
                  >
                    {/* Serviço */}
                    <div className="col-span-3">
                      <div className="font-medium flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        {h.app || "—"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        PHP {h.php} · {h.sapi}
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="col-span-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs",
                          h.is_online
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            h.is_online ? "bg-emerald-500" : "bg-rose-500"
                          )}
                        />
                        {h.status || (h.is_online ? "online" : "offline")}
                      </span>
                    </div>

                    {/* Infra */}
                    <div className="col-span-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={cn(
                            h.db_ok ? "text-foreground" : "text-rose-500"
                          )}
                        >
                          DB
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span>
                          {h.db_ok
                            ? `${h.db_latency_ms ?? 0}ms`
                            : h.db_error || "erro"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={cn(
                            h.cache_ok ? "text-foreground" : "text-rose-500"
                          )}
                        >
                          Cache
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span>
                          {h.cache_ok ? "ok" : h.cache_error || "erro"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={cn(
                            h.disk_ok ? "text-foreground" : "text-rose-500"
                          )}
                        >
                          Disco
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span>
                          {h.disk_ok
                            ? `${
                                (h.disk_free_bytes ?? 0) / 1_000_000_000
                              }GB livres`
                            : h.disk_error || "erro"}
                        </span>
                      </div>
                    </div>

                    {/* Ambiente */}
                    <div className="col-span-2 text-xs text-muted-foreground">
                      <div>{h.env || "—"}</div>
                      <div className="mt-0.5">{h.sapi}</div>
                    </div>

                    {/* Hora */}
                    <div className="col-span-2 text-xs">{timeAgo(h.time)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom pagination */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        meta={meta}
        currentItemsCount={items.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onScrollTop={scrollTop}
      />
    </div>
  );
}
