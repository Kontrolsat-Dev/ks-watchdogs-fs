import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Users2,
  Activity,
  Trophy,
  Timer,
  Package,
} from "lucide-react";

import { useKpiPerformance } from "./queries";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ---------------- helpers ---------------- */

type OrderBy = "avg" | "n" | "min" | "max";
type OrderDir = "asc" | "desc";
type EmployeeRole = "prep" | "invoice";
type ChartMetric = "n_orders" | "avg_min";

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function toApiDate(inputYYYYMMDD: string) {
  // API espera DD-MM-YYYY
  const [y, m, d] = inputYYYYMMDD.split("-");
  return `${d}-${m}-${y}`;
}
function lastNDaysRange(n = 30) {
  const until = new Date();
  const since = new Date();
  since.setDate(until.getDate() - n);
  return { since, until };
}

const CHART_COLOR_1 = "var(--chart-3)";
const CHART_COLOR_2 = "var(--chart-2)";

/* ---------------- page ---------------- */

export default function KpiOrdersPerformancePage() {
  // filtros
  const [role, setRole] = useState<EmployeeRole>("prep");
  const { since, until } = lastNDaysRange(30);
  const [sinceStr, setSinceStr] = useState(toInputDate(since));
  const [untilStr, setUntilStr] = useState(toInputDate(until));
  const [orderBy, setOrderBy] = useState<OrderBy>("avg");
  const [orderDir, setOrderDir] = useState<OrderDir>("asc");
  const [limit, setLimit] = useState<
    "50" | "100" | "200" | "500" | "1000" | "5000"
  >("200");
  const [search, setSearch] = useState("");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("avg_min");

  const params = {
    role,
    since: toApiDate(sinceStr),
    until: toApiDate(untilStr),
    order_by: orderBy,
    order_dir: orderDir,
    limit: Number(limit),
  };

  const { data, isFetching, isError, refetch } = useKpiPerformance(params) as {
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
    data?: {
      ok: boolean;
      role: string;
      since: string;
      until: string;
      order_by: string;
      order_dir: string;
      limit: number;
      count: number;
      items: Array<{
        role: string;
        employee_id: number;
        employee_name: string;
        n_orders: number;
        avg_min: number;
        avg_h: number;
        min_min: number;
        max_min: number;
      }>;
      elapsedMs?: number;
    };
  };

  useEffect(() => {
    if (!isError) return;
    toast.error("Erro ao carregar performance de processamento", {
      id: "kpi-orders-perf-error",
      description: "Tenta recarregar ou ajustar os filtros.",
    });
  }, [isError]);

  const items = (data?.items ?? []).filter(Boolean);

  // filtro por nome
  const filtered = useMemo(() => {
    const txt = search.trim().toLowerCase();
    if (!txt) return items;
    return items.filter((i) =>
      (i.employee_name || "").toLowerCase().includes(txt)
    );
  }, [items, search]);

  // métricas rápidas (ponderadas por nº de encomendas)
  const totalEmployees = filtered.length;
  const totalOrders = filtered.reduce((s, i) => s + (i.n_orders || 0), 0);
  const weightedAvgMin =
    totalOrders > 0
      ? Math.round(
          filtered.reduce(
            (s, i) => s + (i.avg_min || 0) * (i.n_orders || 0),
            0
          ) / totalOrders
        )
      : null;

  // leaderboard (usamos a ordem devolvida pela API para respeitar order_by/dir)
  const leaderboard = filtered;

  // escala para barras mini
  const globalMaxOrders = Math.max(1, ...filtered.map((i) => i.n_orders || 0));
  const globalMaxAvg = Math.max(
    1,
    ...filtered.map((i) => Math.max(i.avg_min || 0, i.max_min || 0))
  );

  // chart data (vertical bars por colaborador)
  const chartData = useMemo(() => {
    const arr = leaderboard.map((i) => ({
      name: i.employee_name || `#${i.employee_id}`,
      n_orders: i.n_orders || 0,
      avg_min: i.avg_min || 0,
    }));
    // Para legibilidade, limitar a 25 no gráfico (o resto continua visível na tabela)
    return arr.slice(0, 25);
  }, [leaderboard]);

  const isInitialLoading = isFetching && !data;

  return (
    <div className="flex flex-col gap-4">
      {/* Header + filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              KPI · Performance de Processamento
            </CardTitle>
            <CardDescription>
              Ranking por colaborador no intervalo selecionado.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRole("prep");
                const r = lastNDaysRange(30);
                setSinceStr(toInputDate(r.since));
                setUntilStr(toInputDate(r.until));
                setOrderBy("avg");
                setOrderDir("asc");
                setLimit("200");
                setSearch("");
                setChartMetric("avg_min");
              }}
            >
              Limpar filtros
            </Button>
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
          {/* Função */}
          <Select
            value={role}
            onValueChange={(v) => setRole(v as EmployeeRole)}
          >
            <SelectTrigger className="w-full md:col-span-1">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prep">Preparação</SelectItem>
              <SelectItem value="invoice">Faturação</SelectItem>
            </SelectContent>
          </Select>

          {/* Datas */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Desde</span>
              <Input
                type="date"
                value={sinceStr}
                onChange={(e) => setSinceStr(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Até</span>
              <Input
                type="date"
                value={untilStr}
                onChange={(e) => setUntilStr(e.target.value)}
              />
            </div>
          </div>

          {/* Ordenação */}
          <Select
            value={orderBy}
            onValueChange={(v) => setOrderBy(v as OrderBy)}
          >
            <SelectTrigger className="w-full md:col-span-1">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avg">Média (min)</SelectItem>
              <SelectItem value="n">Nº Encomendas</SelectItem>
              <SelectItem value="min">Mínimo (min)</SelectItem>
              <SelectItem value="max">Máximo (min)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={orderDir}
            onValueChange={(v) => setOrderDir(v as OrderDir)}
          >
            <SelectTrigger className="w-full md:col-span-1">
              <SelectValue placeholder="Direção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>

          {/* Limite + Pesquisa */}
          <Select value={limit} onValueChange={(v) => setLimit(v as any)}>
            <SelectTrigger className="w-full md:col-span-1">
              <SelectValue placeholder="Limite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
              <SelectItem value="5000">5000</SelectItem>
            </SelectContent>
          </Select>

          <div className="md:col-span-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar colaborador…"
              aria-label="Filtrar colaborador"
            />
          </div>
        </CardContent>
      </Card>

      {/* KPIs rápidos */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {totalEmployees || "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Encomendas (total)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">{totalOrders || "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Tempo médio (ponderado)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {weightedAvgMin != null ? `${weightedAvgMin}m` : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destaques (Top 3) */}
      {leaderboard.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {leaderboard.slice(0, 3).map((e, idx) => (
            <Card key={e.employee_id}>
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-sm">{e.employee_name}</CardTitle>
                </div>
                <div className="text-xs text-muted-foreground">#{idx + 1}</div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{e.n_orders}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{e.avg_min}m</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gráfico (barras) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Comparação (Top até 25)</CardTitle>
            <CardDescription>
              Barras por colaborador — escolhe a métrica a visualizar.
            </CardDescription>
          </div>
          <div className="w-[200px]">
            <Select
              value={chartMetric}
              onValueChange={(v) => setChartMetric(v as ChartMetric)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Métrica do gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avg_min">Tempo médio (min)</SelectItem>
                <SelectItem value="n_orders">Nº encomendas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {isInitialLoading ? (
            <div className="h-[360px] w-full animate-pulse rounded-lg border bg-muted/30" />
          ) : chartData.length === 0 ? (
            <div className="text-sm text-muted-foreground p-6">
              Sem dados para o período/seleção atual.
            </div>
          ) : (
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    domain={[0, "dataMax"]}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    // fundo do tooltip mais escuro em dark (usa tokens do tema)
                    contentStyle={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      color: "var(--popover-foreground)",
                      boxShadow: "0 8px 24px var(--background)",
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                    // overlay de hover mais escuro no dark
                    cursor={{ fill: "var(--muted)" }}
                    wrapperClassName="recharts-tooltip-wrapper" // opcional, se quiseres estilizar via CSS
                  />

                  <Bar
                    dataKey={chartMetric}
                    fill={
                      chartMetric === "avg_min" ? CHART_COLOR_1 : CHART_COLOR_2
                    }
                    radius={[6, 6, 6, 6]}
                    isAnimationActive={false}
                    // barra “ativa” no hover com ligeiro destaque que também respeita o tema
                    activeBar={{
                      fillOpacity: 0.95,
                      stroke: "var(--primary)",
                      strokeWidth: 1,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leaderboard</CardTitle>
          <CardDescription>
            Ordenado pelo servidor ({data?.order_by} · {data?.order_dir}),
            limite: {data?.limit ?? "—"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {isInitialLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-3">
                  <div className="col-span-4 h-6 rounded bg-muted animate-pulse" />
                  <div className="col-span-2 h-6 rounded bg-muted animate-pulse" />
                  <div className="col-span-2 h-6 rounded bg-muted animate-pulse" />
                  <div className="col-span-4 h-6 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-sm text-muted-foreground p-6">
              Sem colaboradores para mostrar.
            </div>
          ) : (
            <div className="space-y-1">
              {/* header */}
              <div className="grid grid-cols-12 gap-3 px-2 py-1.5 text-xs text-muted-foreground">
                <div className="col-span-5">Colaborador</div>
                <div className="col-span-2">Encomendas</div>
                <div className="col-span-2">Média (min)</div>
                <div className="col-span-3">Faixa (min)</div>
              </div>

              {leaderboard.map((e) => {
                const pOrders = Math.max(
                  0.03,
                  (e.n_orders || 0) / globalMaxOrders
                );
                const pAvg = Math.max(
                  0.03,
                  (Math.max(e.avg_min || 0, e.max_min || 0) || 0) / globalMaxAvg
                );
                return (
                  <div
                    key={e.employee_id}
                    className="grid grid-cols-12 gap-3 items-center rounded-md border px-2 py-2"
                  >
                    <div className="col-span-5">
                      <div className="font-medium">{e.employee_name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        ID: {e.employee_id} · Role: {e.role}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="relative h-6 rounded bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded bg-primary/70"
                          style={{ width: `${pOrders * 100}%` }}
                        />
                        <div className="relative z-10 flex h-full items-center justify-center text-xs font-medium">
                          {e.n_orders}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="relative h-6 rounded bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded bg-emerald-500/70 dark:bg-emerald-400/60"
                          style={{ width: `${pAvg * 100}%` }}
                        />
                        <div className="relative z-10 flex h-full items-center justify-center text-xs font-medium">
                          {e.avg_min}m
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-muted-foreground">mín:</span>
                        <span className="font-medium">{e.min_min}m</span>
                      </span>
                      <span className="mx-2 text-muted-foreground">·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="text-muted-foreground">máx:</span>
                        <span className="font-medium">{e.max_min}m</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
