import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SanityItem({
  ok,
  label,
  hint,
}: {
  ok?: boolean | null;
  label: string;
  hint?: string;
}) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  const cls = ok
    ? "text-emerald-600 dark:text-emerald-300"
    : "text-amber-600 dark:text-amber-300";
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={cn("h-4 w-4", cls)} />
      <span>{label}</span>
      {hint && <span className="text-muted-foreground">· {hint}</span>}
    </div>
  );
}
