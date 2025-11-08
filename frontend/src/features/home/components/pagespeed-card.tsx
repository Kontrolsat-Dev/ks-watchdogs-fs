import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import SectionTitle from "./section-title";
import TinyStat from "./tiny-stat";
import { Wifi, Zap } from "lucide-react";
import type { PagespeedKpi } from "@/api/home";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

const CHART_COLOR_1 = "var(--chart-1)";
const CHART_COLOR_2 = "var(--chart-2)";

export default function PagespeedCard({ kpi }: { kpi?: PagespeedKpi }) {
  const series = kpi?.series ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <SectionTitle
          icon={Wifi}
          title="PageSpeed TTFB"
          description="Home e produto"
        />
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <div className="grid gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Home</CardTitle>
              <CardDescription className="text-xs">
                Estado: {kpi?.home.last_status ?? "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <TinyStat
                label="p50"
                value={kpi ? `${kpi.home.p50_ttfb_ms} ms` : "—"}
                icon={Zap}
              />
              <TinyStat
                label="p90"
                value={kpi ? `${kpi.home.p90_ttfb_ms} ms` : "—"}
              />
              <TinyStat
                label="p95"
                value={kpi ? `${kpi.home.p95_ttfb_ms} ms` : "—"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Produto</CardTitle>
              <CardDescription className="text-xs">
                Estado: {kpi?.product.last_status ?? "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <TinyStat
                label="p50"
                value={kpi ? `${kpi.product.p50_ttfb_ms} ms` : "—"}
                icon={Zap}
              />
              <TinyStat
                label="p90"
                value={kpi ? `${kpi.product.p90_ttfb_ms} ms` : "—"}
              />
              <TinyStat
                label="p95"
                value={kpi ? `${kpi.product.p95_ttfb_ms} ms` : "—"}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <div className="h-[280px]">
            {!series.length ? (
              <div className="h-full rounded-md border bg-muted/30" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
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
                    cursor={{ stroke: "var(--muted)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="home_ttfb_ms"
                    stroke={CHART_COLOR_1}
                    dot={false}
                    isAnimationActive={false}
                    name="Home"
                  />
                  <Line
                    type="monotone"
                    dataKey="product_ttfb_ms"
                    stroke={CHART_COLOR_2}
                    dot={false}
                    isAnimationActive={false}
                    name="Produto"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
