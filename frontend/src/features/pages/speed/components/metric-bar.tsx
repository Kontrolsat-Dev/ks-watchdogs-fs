import { cn } from "@/lib/utils";
import { barWidth, levelFromLatency } from "../helpers";

export default function MetricBar({
  label,
  ms,
  kind,
}: {
  label: string;
  ms: number;
  kind: "ttfb" | "total";
}) {
  const level = levelFromLatency(ms, kind);
  const tone =
    level === "ok"
      ? "bg-emerald-500"
      : level === "warning"
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{ms}ms</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full", tone)}
          style={{ width: barWidth(ms, kind) }}
        />
      </div>
    </div>
  );
}
