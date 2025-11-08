import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionTitle from "./section-title";
import TinyStat from "./tiny-stat";
import { Activity } from "lucide-react";
import type { EolKpi } from "@/api/home";
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
const CHART_COLOR_2 = "var(--chart-2)";

export default function EolCard({ kpi }: { kpi?: EolKpi }) {
  const series = kpi?.series ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <SectionTitle
          icon={Activity}
          title="EOL produtos"
          description="Itens com risco de rutura"
        />
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <TinyStat label="Warning" value={kpi ? kpi.warn : "—"} />
          <TinyStat label="Critical" value={kpi ? kpi.critical : "—"} />
        </div>
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
                  dataKey="warn"
                  fill={CHART_COLOR_2}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="critical"
                  fill={CHART_COLOR_1}
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
