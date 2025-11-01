import { cn } from "@/lib/utils";

export default function StateBadge({ state }: { state: string }) {
  const k = (state ?? "").toLowerCase();
  const map: Record<string, { label: string; className: string }> = {
    error: {
      label: "Erro",
      className:
        "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40",
    },
    warning: {
      label: "Aviso",
      className:
        "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
    },
    info: {
      label: "Info",
      className:
        "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40",
    },
  };
  const x = map[k] ?? {
    label: state || "—",
    className:
      "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        x.className
      )}
    >
      {x.label}
    </span>
  );
}

