import { TriangleAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatusPill({ status }: { status: "ok" | "error" }) {
  const map = {
    ok: {
      label: "OK",
      className:
        "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
      Icon: CheckCircle2,
    },
    error: {
      label: "Erro",
      className:
        "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
      Icon: TriangleAlert,
    },
  } as const;
  const x = map[status] ?? map.error;
  const Ico = x.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        x.className
      )}
    >
      <Ico className="h-3.5 w-3.5" />
      {x.label}
    </span>
  );
}
