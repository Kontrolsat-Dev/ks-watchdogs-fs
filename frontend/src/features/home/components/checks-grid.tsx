import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionTitle from "./section-title";
import StatusPill from "./status-pill";
import { Timer, Router as RouterIcon, Server } from "lucide-react";
import type { CheckCard } from "@/api/home";
import { timeAgo } from "@/helpers/time";

export default function ChecksGrid({
  checks,
  loading,
}: {
  checks: CheckCard[];
  loading: boolean;
}) {
  const sorted = checks
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-PT"));

  return (
    <Card>
      <CardHeader className="pb-2">
        <SectionTitle
          icon={Server}
          title="Checks recentes"
          description="Último resultado por tarefa monitorizada"
        />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && sorted.length === 0
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="rounded-lg border p-3 animate-pulse"
              >
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))
          : sorted.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border p-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{c.name}</div>
                  <StatusPill status={c.last_status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    <span>Run</span>
                  </div>
                  <div className="text-right font-medium">
                    {c.last_run_ms} ms
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <RouterIcon className="h-3.5 w-3.5" />
                    <span>Quando</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      {timeAgo(String(c.last_run_at))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
