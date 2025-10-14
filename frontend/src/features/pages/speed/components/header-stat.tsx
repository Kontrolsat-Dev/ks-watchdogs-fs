import { cn } from "@/lib/utils";

export default function HeaderStat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: any;
  label: string;
  value: string;
  tone?: "default" | "ok" | "warn" | "crit";
}) {
  const map = {
    default: "text-foreground",
    ok: "text-emerald-600 dark:text-emerald-300",
    warn: "text-amber-600 dark:text-amber-300",
    crit: "text-red-600 dark:text-red-400",
  } as const;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={cn("h-4 w-4", map[tone])} />
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">· {value}</div>
    </div>
  );
}
