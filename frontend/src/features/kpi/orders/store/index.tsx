// src/features/kpi/store-front-metrics/index.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

import { useKpiStoreFrontMetrics } from "./queries";

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

import {
  RefreshCcw,
  Store,
  TrendingUp,
  ReceiptText,
  Users2,
} from "lucide-react";

/* ---------------- helpers ---------------- */

type StoreMetricKey = "n_orders" | "total_amount";

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// API espera DD-MM-YYYY
function toApiDate(inputYYYYMMDD: string) {
  const [y, m, d] = inputYYYYMMDD.split("-");
  return `${d}-${m}-${y}`;
}

// range default para a loja (últimos 14 dias)
function defaultSinceDate(daysBack = 14) {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  return since;
}

const SERIES_COLORS = {
  n_orders: "var(--chart-1)",
  total_amount: "var(--chart-2)",
};

/* ---------------- componente ---------------- */

export default function KpiStoreFrontMetricsPage() {
  const [metric, setMetric] = useState<StoreMetricKey>("n_orders");
  const defaultSince = defaultSinceDate(14);
  const [sinceStr, setSinceStr] = useState(toInputDate(defaultSince));

  const params = {
    since: toApiDate(sinceStr), // DD-MM-YYYY
  };

  const { data, isFetching, isError, refetch } = useKpiStoreFrontMetrics(
    params
  ) as {
    data?: {
      ok: boolean;
      since: string;
      count_events: number;
      timeseries_daily: Array<{
        bucket: string;
        n_orders: number;
        total_amount: number;
      }>;
      employees: Array<{
        employee_id: number;
        employee_name: string;
        n_orders: number;
        total_amount: number;
        avg_ticket: number;
      }>;
      doc_type_daily: Array<{
        date: string;
        document_type: string;
        n_orders: number;
        total_amount: number;
        avg_ticket: number;
      }>;
      elapsedMs?: number;
    };
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const isInitialLoading = isFetching && !data;

  useEffect(() => {
    if (!isError) return;
    toast.error("Erro ao carregar métricas da loja física", {
      id: "kpi-store-front-error",
      description: "Tenta recarregar ou ajustar a data inicial.",
    });
  }, [isError]);

  const timeseries = data?.timeseries_daily ?? [];
  const employees = data?.employees ?? [];
  const docTypeDaily = data?.doc_type_daily ?? [];

  /* ---------------- KPIs rápidos ---------------- */

  const kpiTotalOrders = useMemo(
    () => timeseries.reduce((sum, d) => sum + (d.n_orders || 0), 0),
    [timeseries]
  );

  const kpiTotalAmount = useMemo(
    () => timeseries.reduce((sum, d) => sum + (d.total_amount || 0), 0),
    [timeseries]
  );

  const kpiAvgTicket = useMemo(() => {
    if (!kpiTotalOrders) return null;
    return kpiTotalAmount / kpiTotalOrders;
  }, [kpiTotalAmount, kpiTotalOrders]);

  const topEmployee = employees[0];

  /* ---------------- dados para gráfico ---------------- */

  const chartData = useMemo(() => {
    const sorted = [...timeseries].sort((a, b) => {
      // bucket já vem YYYY-MM-DD, mas garantimos
      const A = Date.parse(a.bucket) || 0;
      const B = Date.parse(b.bucket) || 0;
      return A - B;
    });

    return sorted.map((d) => ({
      bucket: d.bucket,
      n_orders: d.n_orders,
      total_amount: Number(d.total_amount.toFixed(2)),
    }));
  }, [timeseries]);

  /* ---------------- handlers ---------------- */

  const handleResetFilters = () => {
    const s = defaultSinceDate(14);
    setSinceStr(toInputDate(s));
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col gap-4">
      {/* Header + filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              KPI · Loja Física (Front Invoice Audit)
            </CardTitle>
            <CardDescription>
              Visão rápida das vendas em balcão: volume, faturação e
              colaboradores que mais faturam.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              disabled={isFetching}
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

        <CardContent className="grid gap-3 grid-cols-4">
          {/* Data since */}
          <div className="flex flex-col gap-1 col-span-2">
            <span className="text-xs text-muted-foreground">Desde</span>
            <Input
              type="date"
              value={sinceStr}
              onChange={(e) => setSinceStr(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              A API recebe DD-MM-YYYY a partir deste valor.
            </p>
          </div>

          {/* Métrica do gráfico */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Métrica do gráfico
            </span>
            <Select
              value={metric}
              onValueChange={(v) => setMetric(v as StoreMetricKey)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolher métrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="n_orders">Nº documentos</SelectItem>
                <SelectItem value="total_amount">
                  Faturação total (€)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info de carregamento */}
          <div className="flex flex-col items-end justify-center gap-1 text-xs text-muted-foreground">
            <span>
              {isFetching
                ? "A atualizar métricas…"
                : data?.elapsedMs != null
                ? `Carregado em ${Math.round(data.elapsedMs)}ms`
                : "Pronto"}
            </span>
            <span>
              Eventos carregados:{" "}
              <span className="font-medium">{data?.count_events ?? "—"}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principais */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {kpiTotalOrders || "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Faturação total (€)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {kpiTotalAmount ? kpiTotalAmount.toFixed(2) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Ticket médio (€)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {kpiAvgTicket != null ? kpiAvgTicket.toFixed(2) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Top colaborador
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {topEmployee?.employee_name ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {topEmployee
                    ? `${
                        topEmployee.n_orders
                      } docs · ${topEmployee.total_amount.toFixed(2)} €`
                    : "Sem dados"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico timeseries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Evolução diária ·{" "}
            {metric === "n_orders"
              ? "Nº de documentos emitidos"
              : "Faturação total (€)"}
          </CardTitle>
          <CardDescription>
            Baseado nos eventos de <code>document_created</code> do
            frontInvoiceAudit.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {isInitialLoading ? (
            <div className="h-[320px] w-full animate-pulse rounded-lg border bg-muted/30" />
          ) : chartData.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Sem dados para o período selecionado.
            </div>
          ) : (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="bucket"
                    tick={{ fontSize: 11 }}
                    tickMargin={6}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      color: "var(--popover-foreground)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                    formatter={(value: any) => {
                      if (metric === "total_amount") {
                        return [`${Number(value).toFixed(2)} €`, "Faturação"];
                      }
                      return [value, "Nº docs"];
                    }}
                    labelFormatter={(label: any) => `Dia ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={SERIES_COLORS[metric]}
                    fill={SERIES_COLORS[metric]}
                    fillOpacity={0.28}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela colaboradores */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Ranking por colaborador</CardTitle>
            <CardDescription>
              Ordenado por faturação total (descendente).
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {employees.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                Ainda não há documentos para este período.
              </div>
            ) : (
              <div className="max-h-[360px] overflow-auto">
                <table className="w-full border-t text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">#</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Colaborador
                      </th>
                      <th className="px-2 py-2 text-right font-medium">Docs</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Faturação (€)
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Ticket médio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((e, idx) => (
                      <tr
                        key={e.employee_id}
                        className={cn(
                          "border-b last:border-b-0",
                          idx % 2 === 1 && "bg-muted/10"
                        )}
                      >
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {e.employee_name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              ID {e.employee_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right">{e.n_orders}</td>
                        <td className="px-2 py-2 text-right">
                          {e.total_amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {e.avg_ticket.toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela por tipo de documento */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">
              Totais por dia e tipo de documento
            </CardTitle>
            <CardDescription>
              FR, ELO, NRE, etc. com nº de docs e faturação.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {docTypeDaily.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                Sem movimentos para mostrar.
              </div>
            ) : (
              <div className="max-h-[360px] overflow-auto">
                <table className="w-full border-t text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Dia</th>
                      <th className="px-2 py-2 text-left font-medium">
                        Documento
                      </th>
                      <th className="px-2 py-2 text-right font-medium">Docs</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Faturação (€)
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Ticket médio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {docTypeDaily.map((row, idx) => (
                      <tr
                        key={`${row.date}-${row.document_type}-${idx}`}
                        className={cn(
                          "border-b last:border-b-0",
                          idx % 2 === 1 && "bg-muted/10"
                        )}
                      >
                        <td className="px-4 py-2 text-sm">{row.date}</td>
                        <td className="px-2 py-2 text-sm">
                          <span className="inline-flex rounded-full border px-2 py-0.5 text-[11px]">
                            {row.document_type}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right">{row.n_orders}</td>
                        <td className="px-2 py-2 text-right">
                          {row.total_amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {row.avg_ticket.toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
