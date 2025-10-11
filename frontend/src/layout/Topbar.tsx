import { useHealthz } from "@/features/system/healthz/queries.ts";
import { StatusDot } from "@/components/feedback/StatusDot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Moon,
  RefreshCcw,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

type Props = {
  onToggleMobile: () => void; // abre/fecha gaveta no mobile
  onToggleCollapse: () => void; // colapsa/expande no desktop
  isSidebarOpen: boolean; // estado da gaveta no mobile
  collapsed: boolean; // estado colapsado no desktop
};

export default function Topbar({
  onToggleMobile,
  onToggleCollapse,
  isSidebarOpen,
  collapsed,
}: Props) {
  const { data, isFetching, refetch, isError } = useHealthz();

  const status = isError
    ? "critical"
    : !data
    ? "warning"
    : data.status?.toLowerCase();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const latencyMs = data?.elapsedMs ? Math.round(data.elapsedMs) : null;

  return (
    <div className="sticky top-0 z-10 h-14 mb-4 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Esquerda: botões + título */}
        <div className="flex items-center gap-2">
          {/* Mobile: abrir/fechar gaveta */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMobile}
            aria-label={isSidebarOpen ? "Fechar navegação" : "Abrir navegação"}
            className="md:hidden"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Desktop: colapsar/expandir sidebar */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir navegação" : "Colapsar navegação"}
            className="hidden md:inline-flex"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          <div className="ml-1 text-sm font-medium">Watchdogs</div>
          <span className="text-xs text-muted-foreground">
            Sistema de Monitorização de Ecommerce
          </span>
        </div>

        {/* Direita: estado + ações */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
              status === "ok" && "border-emerald-200",
              status !== "ok" && "border-amber-200"
            )}
            title={
              isError
                ? "Erro ao verificar saúde do backend"
                : "Estado do backend"
            }
          >
            <StatusDot status={status || "warning"} />
            <span className="hidden sm:inline">
              {isError ? "Backend: erro" : `Backend: ${data?.status ?? "…"}`}
            </span>
            {data?.env && (
              <span className="text-muted-foreground">· {data.env}</span>
            )}
            {typeof data?.db_ok === "boolean" && (
              <span
                className={cn(
                  "ml-1",
                  data.db_ok ? "text-emerald-600" : "text-red-600"
                )}
              >
                DB {data.db_ok ? "ok" : "down"}
              </span>
            )}
            {latencyMs !== null && (
              <span className="text-muted-foreground">· {latencyMs}ms</span>
            )}
            {isFetching && (
              <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" />
            )}
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            aria-label="Atualizar estado"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {/* Toggle tema */}
          <div
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`flex items-center cursor-pointer transition-transform duration-500 ${
              isDark ? "rotate-180" : "rotate-0"
            }`}
          >
            {isDark ? (
              <Sun className="h-6 w-6 text-yellow-500 rotate-0 transition-all" />
            ) : (
              <Moon className="h-6 w-6 text-blue-500 rotate-0 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
