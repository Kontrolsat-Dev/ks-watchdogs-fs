import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionTitle from "./section-title";
import { Database } from "lucide-react";
import type { CartsStaleKpi } from "@/api/home";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

const CHART_COLOR_3 = "var(--chart-3)";

export default function CartsCard({ kpi }: { kpi?: CartsStaleKpi }) {
  const series = kpi?.series ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <SectionTitle
          icon={Database}
          title="Carrinhos inativos"
          description="Contagem acima do limite"
        />
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          {!series.length ? (
            <div className="h-full rounded-md border bg-muted/30" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series}
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="ts" tick={{ fontSize: 12 }} />
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
                  dataKey="count"
                  fill={CHART_COLOR_3}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
