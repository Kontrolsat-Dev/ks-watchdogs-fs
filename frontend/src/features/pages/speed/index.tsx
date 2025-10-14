import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCcw,
  Globe,
  Link2,
  ExternalLink,
  Copy,
  Activity,
  Timer,
} from "lucide-react";

import { usePagesSpeed } from "./queries";
import type { PerfItem, PerfResponse } from "@/api/prestashop/types";
import StatusPill from "./components/status-pill";
import MetricBar from "./components/metric-bar";
import LoadingCards from "./components/loading-cards";
import { formatDate, timeAgo } from "@/helpers/time";
import { formatBytes, levelFromLatency, toneFromLevel } from "./helpers";
import HeaderStat from "./components/header-stat";
import SanityItem from "./components/sanity-item";
import FlashError from "@/components/data/flash-error";

export default function PageSpeedPage() {
  const { data, isFetching, isError, refetch } = usePagesSpeed() as {
    data?: PerfResponse;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isError) {
    return (
      <FlashError
        flashId="page-speed-error"
        flashTitle="Erro ao carregar estados das páginas"
        flashMessage="Não foi possível carregar os dados dos estados das páginas."
        cardTitle="Estados das páginas"
        cardDescription="Não foi possível carregar os dados."
        cardButtonAction={() => refetch()}
        cardButtonText="Tentar novamente"
      />
    );
  }

  const items = (data?.items ?? []) as PerfItem[];

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "ok" | "warning" | "critical">(
    "all"
  );
  const [type, setType] = useState<"all" | string>("all");
  const [sortBy, setSortBy] = useState<"total" | "ttfb">("total");

  // derive tipos a partir dos dados
  const pageTypes = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.page_type);
    return ["all", ...Array.from(set)];
  }, [items]);

  // filtragem + ordenação
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return items
      .filter((it) =>
        text
          ? it.url.toLowerCase().includes(text) ||
            it.page_type.toLowerCase().includes(text)
          : true
      )
      .filter((it) =>
        status === "all" ? true : (it.status ?? "").toLowerCase() === status
      )
      .filter((it) =>
        type === "all"
          ? true
          : (it.page_type ?? "").toLowerCase() === type.toLowerCase()
      )
      .sort((a, b) =>
        sortBy === "total" ? b.total_ms - a.total_ms : b.ttfb_ms - a.ttfb_ms
      );
  }, [items, q, status, type, sortBy]);

  // stats
  const lastObserved = useMemo(() => {
    let max = 0;
    for (const it of items) {
      const t = Date.parse(it.observed_at ?? "");
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [items]);

  const avgTtfb = useMemo(() => {
    if (!filtered.length) return null;
    return Math.round(
      filtered.reduce((s, i) => s + i.ttfb_ms, 0) / filtered.length
    );
  }, [filtered]);
  const avgTotal = useMemo(() => {
    if (!filtered.length) return null;
    return Math.round(
      filtered.reduce((s, i) => s + i.total_ms, 0) / filtered.length
    );
  }, [filtered]);

  const isInitialLoading = isFetching && (!data || items.length === 0);
  if (isInitialLoading) return <LoadingCards />;

  const hasFilters =
    q !== "" || status !== "all" || type !== "all" || sortBy !== "total";

  return (
    <div className="flex flex-col gap-4">
      {/* Header + filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Velocidade de Páginas
            </CardTitle>
            <CardDescription>
              Total:{" "}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>
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
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <HeaderStat
                icon={Timer}
                label="TTFB médio"
                value={avgTtfb != null ? `${avgTtfb}ms` : "—"}
                tone={
                  avgTtfb != null
                    ? toneFromLevel(levelFromLatency(avgTtfb, "ttfb"))
                    : "default"
                }
              />
              <HeaderStat
                icon={Activity}
                label="Total médio"
                value={avgTotal != null ? `${avgTotal}ms` : "—"}
                tone={
                  avgTtfb != null
                    ? toneFromLevel(levelFromLatency(avgTtfb, "ttfb"))
                    : "default"
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setType("all");
                  setSortBy("total");
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
          {/* Estado */}
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

          {/* Tipo */}
          <Select value={type} onValueChange={(v) => setType(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo de página" />
            </SelectTrigger>
            <SelectContent>
              {pageTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ordenação */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as typeof sortBy)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Tempo total (desc)</SelectItem>
              <SelectItem value="ttfb">TTFB (desc)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground p-6">
          Nenhuma página encontrada com os filtros atuais.
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1">
          {filtered.map((it) => {
            const ttfbLevel = levelFromLatency(it.ttfb_ms, "ttfb");
            const totalLevel = levelFromLatency(it.total_ms, "total");
            return (
              <Card key={it.url} className="overflow-hidden">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {it.page_type}
                    </Badge>
                    <StatusPill value={it.status} />
                  </div>

                  <div className="mt-1 flex items-start gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {it.url}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">HTTP {it.status_code}</Badge>
                        {it.headers?.server && (
                          <Badge variant="outline">{it.headers.server}</Badge>
                        )}
                        {it.headers?.cf_cache_status && (
                          <Badge variant="outline">
                            CF: {it.headers.cf_cache_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigator.clipboard.writeText(it.url)}
                        aria-label="Copiar URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        aria-label="Abrir URL"
                      >
                        <a href={it.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Métricas com barras */}
                  <MetricBar label="TTFB" ms={it.ttfb_ms} kind="ttfb" />
                  <MetricBar
                    label="Tempo total"
                    ms={it.total_ms}
                    kind="total"
                  />

                  {/* Meta info compacta */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between rounded-md border px-2 py-1.5">
                      <span className="text-muted-foreground">HTML</span>
                      <span
                        className={cn(
                          (it.html_bytes ?? 0) > 500_000 &&
                            "text-amber-600 dark:text-amber-300",
                          (it.html_bytes ?? 0) > 1_000_000 &&
                            "text-red-600 dark:text-red-400"
                        )}
                      >
                        {formatBytes(it.html_bytes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border px-2 py-1.5">
                      <span className="text-muted-foreground">Cache</span>
                      <span>
                        {it.headers?.cache_control?.split(",")[0] || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Sanity checklist */}
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                    <SanityItem
                      ok={it.sanity?.title_ok}
                      label="Título"
                      hint={
                        it.sanity?.title_len != null
                          ? `${it.sanity.title_len}c`
                          : undefined
                      }
                    />
                    <SanityItem
                      ok={it.sanity?.meta_desc_ok}
                      label="Meta descrição"
                      hint={
                        it.sanity?.meta_desc_len != null
                          ? `${it.sanity.meta_desc_len}c`
                          : undefined
                      }
                    />
                    <SanityItem ok={it.sanity?.h1_ok} label="H1" />
                    <SanityItem ok={it.sanity?.canonical_ok} label="Canónica" />
                    <SanityItem
                      ok={it.sanity?.jsonld_product_ok ?? null}
                      label="JSON-LD Produto"
                    />
                    <SanityItem
                      ok={
                        !(
                          it.sanity?.blocking_scripts_in_head &&
                          it.sanity.blocking_scripts_in_head > 0
                        )
                      }
                      label="Scripts bloqueantes"
                      hint={String(it.sanity?.blocking_scripts_in_head ?? 0)}
                    />
                  </div>

                  {/* Observado */}
                  <div className="pt-1 text-xs text-muted-foreground">
                    Observado:{" "}
                    <span title={formatDate(it.observed_at)}>
                      {timeAgo(it.observed_at)}
                    </span>
                  </div>
                </CardContent>

                {/* Rodapé tonal (só para frisar nível geral) */}
                <div
                  className={cn(
                    "h-1 w-full",
                    ttfbLevel === "critical" || totalLevel === "critical"
                      ? "bg-red-500"
                      : ttfbLevel === "warning" || totalLevel === "warning"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  )}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
