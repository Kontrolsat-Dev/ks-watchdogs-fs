import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionTitle from "./section-title";
import TinyStat from "./tiny-stat";
import { Activity, Package } from "lucide-react";
import type { OrdersDelayedKpi } from "@/api/home";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

const CHART_COLOR_1 = "var(--chart-1)";

export default function OrdersDelayedCard({ kpi }: { kpi?: OrdersDelayedKpi }) {
  const series = kpi?.series ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <SectionTitle
          icon={Package}
          title="Encomendas atrasadas"
          description="Total, tipo e evolução"
        />
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1 grid gap-3">
          <TinyStat
            label="Total"
            value={kpi ? kpi.total : "—"}
            icon={Activity}
          />
          <div className="grid grid-cols-2 gap-3">
            <TinyStat label="Standard" value={kpi ? kpi.by_type.std : "—"} />
            <TinyStat
              label="Dropship"
              value={kpi ? kpi.by_type.dropship : "—"}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="h-[260px]">
            {!series.length ? (
              <div className="h-full rounded-md border bg-muted/30" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={series}
                  margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis
                    dataKey="ts"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      color: "var(--popover-foreground)",
                      boxShadow: "0 8px 24px var(--background)",
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Bar
                    dataKey="total"
                    fill={CHART_COLOR_1}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
