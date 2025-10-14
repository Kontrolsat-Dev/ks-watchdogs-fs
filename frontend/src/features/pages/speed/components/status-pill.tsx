import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, CircleHelp } from "lucide-react";

export default function StatusPill({ value }: { value?: string }) {
  const k = (value ?? "").toLowerCase();
  const map: Record<string, { label: string; className: string; Icon: any }> = {
    critical: {
      label: "Crítico",
      className:
        "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
      Icon: AlertTriangle,
    },
    warning: {
      label: "Aviso",
      className:
        "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
      Icon: CircleHelp,
    },
    ok: {
      label: "OK",
      className:
        "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
      Icon: CheckCircle2,
    },
  };
  const x = map[k] ?? map.warning;
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
