// src/features/kpi/orders/timeseries/index.tsx
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
import { RefreshCcw, Users2, Activity, TrendingUp } from "lucide-react";

import { useKpiTimeseries } from "./queries"; // ajusta o path se necessário
import type { EmployeeRole, Granularity } from "@/api/kpi/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ---------------- helpers ---------------- */

type MetricKey = "n_orders" | "avg_min";

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
function lastNDaysRange(n = 14) {
  const until = new Date();
  const since = new Date();
  since.setDate(until.getDate() - n);
  return { since, until };
}

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/* ---------------- Legend custom ---------------- */

function CustomLegend({
  names,
  hidden,
  colors,
  onToggle,
}: {
  names: string[];
  hidden: Record<string, boolean>;
  colors: string[];
  onToggle: (name: string) => void;
}) {
  if (names.length === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {names.map((name, idx) => {
        const isHidden = !!hidden[name];
        const color = colors[idx % colors.length];
        return (
          <button
            key={name}
            type="button"
            onClick={() => onToggle(name)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-opacity",
              isHidden ? "opacity-60" : "opacity-100",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            title={isHidden ? "Mostrar" : "Ocultar"}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="whitespace-nowrap">{name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- page ---------------- */

export default function KpiOrdersTimeseriesPage() {
  // filtros
  const [role, setRole] = useState<EmployeeRole>("prep" as EmployeeRole);
  const [gran, setGran] = useState<Granularity>("day" as Granularity);
  const { since, until } = lastNDaysRange(14);
  const [sinceStr, setSinceStr] = useState(toInputDate(since));
  const [untilStr, setUntilStr] = useState(toInputDate(until));
  const [metric, setMetric] = useState<MetricKey>("n_orders");
  const [topN, setTopN] = useState<"5" | "10" | "15" | "20" | "all">("10");
  const [search, setSearch] = useState("");

  const params = {
    role,
    gran,
    since: toApiDate(sinceStr),
    until: toApiDate(untilStr),
  };

  const { data, isFetching, isError, refetch } = useKpiTimeseries(params) as {
    data?: {
      ok: boolean;
      role: string;
      gran: string;
      since: string;
      until: string;
      count: number;
      employees: Array<{
        role: string;
        employee_id: number;
        employee_name: string;
        points: Array<{
          bucket: string;
          n_orders: number;
          avg_min: number;
          avg_h: number;
        }>;
      }>;
      elapsedMs?: number;
    };
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  useEffect(() => {
    if (!isError) return;
    toast.error("Erro ao carregar timeseries de processamento", {
      id: "kpi-orders-ts-error",
      description: "Tenta recarregar ou ajustar os filtros.",
    });
  }, [isError]);

  const employees = data?.employees ?? [];

  // aplicar filtro por nome
  const filteredEmps = useMemo(() => {
    const txt = search.trim().toLowerCase();
    if (!txt) return employees;
    return employees.filter((e) =>
      (e.employee_name || "").toLowerCase().includes(txt)
    );
  }, [employees, search]);

  // ordenar por total de encomendas (desc) para definir Top N
  const sortedByTotal = useMemo(() => {
    return [...filteredEmps].sort((a, b) => {
      const ta = (a.points || []).reduce((s, p) => s + (p.n_orders || 0), 0);
      const tb = (b.points || []).reduce((s, p) => s + (p.n_orders || 0), 0);
      return tb - ta;
    });
  }, [filteredEmps]);

  const topEmployees = useMemo(() => {
    if (topN === "all") return sortedByTotal;
    return sortedByTotal.slice(0, Number(topN));
  }, [sortedByTotal, topN]);

  // construir série por bucket agregando colunas dinamicamente por employee_name
  const seriesData = useMemo(() => {
    const map: Record<string, any> = {};
    for (const emp of topEmployees) {
      const name = emp.employee_name || `#${emp.employee_id}`;
      for (const p of emp.points ?? []) {
        if (!map[p.bucket]) map[p.bucket] = { bucket: p.bucket };
        map[p.bucket][name] = metric === "n_orders" ? p.n_orders : p.avg_min;
      }
    }
    const arr = Object.values(map);
    // ordenar buckets por data asc (aceita DD-MM-YYYY ou YYYY-MM-DD)
    return arr.sort((a: any, b: any) => {
      const A =
        Date.parse(a.bucket.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")) ||
        Date.parse(a.bucket) ||
        0;
      const B =
        Date.parse(b.bucket.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")) ||
        Date.parse(b.bucket) ||
        0;
      return A - B;
    });
  }, [topEmployees, metric]);

  const visibleNames = useMemo(
    () => topEmployees.map((e) => e.employee_name || `#${e.employee_id}`),
    [topEmployees]
  );

  // séries visíveis/ocultas (controlado)
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const toggleSeries = (name: string) =>
    setHidden((m) => ({ ...m, [name]: !m[name] }));

  // KPIs
  const kpiEmployees = filteredEmps.length;
  const kpiTotalOrders = filteredEmps.reduce(
    (sum, e) => sum + e.points.reduce((s, p) => s + (p.n_orders || 0), 0),
    0
  );
  const kpiAvgMin =
    filteredEmps.length > 0
      ? Math.round(
          filteredEmps.reduce(
            (s, e) =>
              s +
              (e.points.length
                ? e.points.reduce((ss, p) => ss + (p.avg_min || 0), 0) /
                  e.points.length
                : 0),
            0
          ) / filteredEmps.length
        )
      : null;

  const isInitialLoading = isFetching && !data;

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col gap-4">
      {/* Header + filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              KPI · Timeseries de Processamento
            </CardTitle>
            <CardDescription>
              Comparação temporal por colaborador (preparação/faturação).
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRole("prep" as EmployeeRole);
                setGran("day" as Granularity);
                const r = lastNDaysRange(14);
                setSinceStr(toInputDate(r.since));
                setUntilStr(toInputDate(r.until));
                setMetric("n_orders");
                setTopN("10");
                setSearch("");
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

          {/* Granularidade */}
          <Select value={gran} onValueChange={(v) => setGran(v as Granularity)}>
            <SelectTrigger className="w-full md:col-span-1">
              <SelectValue placeholder="Granularidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
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

          {/* Métrica */}
          <Select
            value={metric}
            onValueChange={(v) => setMetric(v as MetricKey)}
          >
            <SelectTrigger className="w-full md:col-span-1">
              <SelectValue placeholder="Métrica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n_orders">Nº encomendas</SelectItem>
              <SelectItem value="avg_min">Tempo médio (min)</SelectItem>
            </SelectContent>
          </Select>

          {/* Top N */}
          <Select value={topN} onValueChange={(v) => setTopN(v as any)}>
            <SelectTrigger className="w-full md:col-span-1">
              <SelectValue placeholder="Top N" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="15">Top 15</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por colaborador */}
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
            <div className="text-2xl font-semibold">{kpiEmployees || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Encomendas (total)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {kpiTotalOrders || "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Média tempo (min)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {kpiAvgMin != null ? `${kpiAvgMin}m` : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico comparativo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Evolução ·{" "}
            {metric === "n_orders" ? "Nº encomendas" : "Tempo médio (min)"}
          </CardTitle>
          <CardDescription>
            Clica na legenda para ocultar/mostrar séries.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {isInitialLoading ? (
            <div className="h-[340px] w-full animate-pulse rounded-lg border bg-muted/30" />
          ) : (seriesData?.length ?? 0) === 0 ? (
            <div className="text-sm text-muted-foreground p-6">
              Sem dados para o período/seleção atual.
            </div>
          ) : (
            <>
              {/* Legend custom (controlada) */}
              <CustomLegend
                names={visibleNames}
                hidden={hidden}
                colors={SERIES_COLORS}
                onToggle={toggleSeries}
              />
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={seriesData}
                    margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
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
                    {visibleNames.map((name, idx) =>
                      hidden[name] ? null : (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          name={name}
                          stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                          dot={false}
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      )
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
