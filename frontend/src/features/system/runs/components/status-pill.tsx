import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";

export default function StatusPill({ value }: { value?: string }) {
  const k = (value ?? "").toLowerCase();
  const map: Record<
    string,
    { label: string; Icon: React.ElementType; className: string }
  > = {
    ok: {
      label: "OK",
      Icon: CheckCircle2,
      className:
        "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
    },
    warning: {
      label: "Aviso",
      Icon: CircleHelp,
      className:
        "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
    },
    critical: {
      label: "Crítico",
      Icon: AlertTriangle,
      className:
        "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
    },
    error: {
      label: "Erro",
      Icon: XCircle,
      className:
        "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
    },
    running: {
      label: "A correr",
      Icon: Loader2,
      className:
        "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/40",
    },
    queued: {
      label: "Em fila",
      Icon: Clock,
      className: "bg-muted text-muted-foreground border border-border",
    },
  };
  const x = map[k] ?? {
    label: value ?? "—",
    Icon: Info,
    className: "bg-muted text-muted-foreground border border-border",
  };
  const Ico = x.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        x.className
      )}
    >
      <Ico className={cn("h-3.5 w-3.5", k === "running" && "animate-spin")} />
      {x.label}
    </span>
  );
}
