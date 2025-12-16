import { useHealthz } from "@/features/system/healthz/queries.ts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Moon,
  Sun,
  Menu,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Circle,
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { useLogout } from "@/lib/auth-hooks";

type Props = {
  onToggleMobile: () => void;
  onToggleMini: () => void;
  isSidebarOpen: boolean;
  mini: boolean;
};

export default function Topbar({
  onToggleMobile,
  onToggleMini,
  isSidebarOpen,
  mini,
}: Props) {
  const { data, isFetching, isError } = useHealthz();

  const status = isError
    ? "critical"
    : !data
    ? "warning"
    : data.status?.toLowerCase();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const latencyMs = data?.elapsedMs ? Math.round(data.elapsedMs) : null;

  const logout = useLogout();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-14",
        "border-b border-border/40",
        // Glassmorphism
        "bg-background/60 backdrop-blur-xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-background/40"
      )}
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Navigation controls */}
        <div className="flex items-center gap-1">
          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobile}
            aria-label={isSidebarOpen ? "Fechar navegação" : "Abrir navegação"}
            className="md:hidden h-8 w-8 hover:bg-accent/50"
          >
            <Menu className={cn("h-4 w-4", isSidebarOpen && "hidden")} />
            <PanelLeftClose className={cn("h-4 w-4", !isSidebarOpen && "hidden")} />
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMini}
            aria-label={mini ? "Expandir sidebar" : "Colapsar sidebar"}
            className="hidden md:flex h-8 w-8 hover:bg-accent/50"
          >
            {mini ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          {/* Separator */}
          <div className="hidden md:block h-4 w-px bg-border/60 mx-2" />

          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Watchdogs</span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              / Monitorização
            </span>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-2">
          {/* Status Pill */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              "border transition-colors",
              status === "ok" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              status === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
              status === "critical" && "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            <Circle
              className={cn(
                "h-1.5 w-1.5 fill-current",
                isFetching && "animate-pulse"
              )}
            />
            <span className="hidden sm:inline">
              {isError ? "Offline" : data?.status ?? "..."}
            </span>
            {latencyMs !== null && (
              <span className="text-[10px] opacity-70">{latencyMs}ms</span>
            )}
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-8 w-8 hover:bg-accent/50"
            aria-label="Alternar tema"
          >
            <Sun className={cn(
              "h-4 w-4 transition-all",
              isDark ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute"
            )} />
            <Moon className={cn(
              "h-4 w-4 transition-all",
              isDark ? "-rotate-90 scale-0 absolute" : "rotate-0 scale-100"
            )} />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Terminar sessão"
            aria-label="Terminar sessão"
            className="h-8 w-8 hover:bg-accent/50 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
