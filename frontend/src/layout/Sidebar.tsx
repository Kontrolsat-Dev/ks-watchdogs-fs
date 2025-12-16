import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Store,
  ChevronRight,
  Wrench,
  Truck,
  BarChart3,
  Globe,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  mini: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type NavItem = { to: string; label: string };
type NavGroup = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: NavItem[];
};

const NAV_ITEMS: NavGroup[] = [
  {
    name: "Prestashop",
    icon: Store,
    items: [
      { to: "/prestashop/payments", label: "Métodos de Pagamento" },
      { to: "/prestashop/orders/delayed", label: "Encomendas Atrasadas" },
      { to: "/prestashop/carts/abandoned", label: "Carrinhos Abandonados" },
      { to: "/prestashop/products/eol", label: "Produtos EOL" },
      { to: "/prestashop/pages/loading", label: "Carregamento Páginas" },
    ],
  },
  {
    name: "Ferramentas",
    icon: Wrench,
    items: [
      { to: "/pda", label: "PDA" },
      { to: "/patife", label: "Patife" },
      { to: "/policia", label: "Policia" },
      { to: "/gc", label: "Gestor de Campanhas" },
    ],
  },
  {
    name: "Serviços",
    icon: Globe,
    items: [
      { to: "/bulkgate", label: "Bulkgate" },
      { to: "/mailchimp", label: "Mailchimp" },
    ],
  },
  {
    name: "Métricas",
    icon: BarChart3,
    items: [
      { to: "/kpi/orders/performance", label: "Performance Encomendas" },
      { to: "/kpi/orders/timeseries", label: "Timeseries Encomendas" },
      { to: "/kpi/store/performance", label: "Performance Loja" },
    ],
  },
  {
    name: "Transportadoras",
    icon: Truck,
    items: [
      { to: "/carriers/nacex", label: "Nacex" },
      { to: "/carriers/ctt", label: "CTT" },
      { to: "/carriers/dpd", label: "DPD" },
      { to: "/carriers/ttm", label: "TTM" },
    ],
  },
  {
    name: "Sistema",
    icon: Settings,
    items: [{ to: "/system/runs", label: "Logs de Análises" }],
  },
];

const GROUPS_KEY = "sidebar_groups_v1";

export default function Sidebar({ mini, mobileOpen, onCloseMobile }: Props) {
  const location = useLocation();

  const allFalse = useMemo(
    () =>
      Object.fromEntries(NAV_ITEMS.map((g) => [g.name, false])) as Record<
        string,
        boolean
      >,
    []
  );

  const readSaved = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(GROUPS_KEY) || "{}"
      ) as Record<string, boolean>;
      const base: Record<string, boolean> = { ...allFalse };
      for (const g of NAV_ITEMS) base[g.name] = saved[g.name] ?? false;
      return base;
    } catch {
      return { ...allFalse };
    }
  };

  const [open, setOpen] = useState<Record<string, boolean>>(() => readSaved());

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(open));
  }, [open]);

  useEffect(() => {
    setOpen((m) => {
      const next = { ...m };
      for (const g of NAV_ITEMS) {
        const active = g.items.some((i) => location.pathname.startsWith(i.to));
        if (active) next[g.name] = true;
      }
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (name: string) =>
    setOpen((m) => ({ ...m, [name]: !m[name] }));

  const groupIsActive = (g: NavGroup) =>
    g.items.some((i) => location.pathname.startsWith(i.to));

  return (
    <aside
      role="navigation"
      aria-label="Navegação principal"
      className={cn(
        "fixed md:static inset-y-0 left-0 z-40 h-full md:h-screen",
        "border-r border-border/40",
        // Glassmorphism
        "bg-background/80 backdrop-blur-xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-background/60",
        // Transitions
        "transition-[width,transform] duration-200 ease-out",
        mini ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "h-14 flex items-center border-b border-border/40",
          mini ? "justify-center px-2" : "px-4 gap-3"
        )}
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Watchdogs"
            className="h-5 w-5"
          />
        </div>
        {!mini && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Watchdogs</span>
            <span className="text-[10px] text-muted-foreground">v2.0</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-auto h-[calc(100%-3.5rem)] sidebar-scroll">
        {/* Dashboard */}
        <NavLink
          to="/"
          end
          onClick={onCloseMobile}
          title={mini ? "Dashboard" : undefined}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg transition-all duration-150",
              mini ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2",
              "hover:bg-accent/50",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !mini && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
              )}
              <LayoutDashboard
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive && "text-primary"
                )}
              />
              {!mini && <span className="text-sm">Dashboard</span>}
            </>
          )}
        </NavLink>

        {/* Separator */}
        {!mini && (
          <div className="my-3 mx-3 h-px bg-border/60" />
        )}

        {/* Groups */}
        {NAV_ITEMS.map((group) => {
          const { name, icon: Icon, items } = group;
          const isOpen = open[name];
          const isGrpActive = groupIsActive(group);

          return (
            <div key={name}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(name)}
                title={mini ? name : undefined}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg transition-all duration-150",
                  mini ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2 justify-between",
                  "hover:bg-accent/50",
                  isGrpActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isGrpActive && "text-primary"
                    )}
                  />
                  {!mini && (
                    <span className="text-sm font-medium">{name}</span>
                  )}
                </div>
                {!mini && (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )}
                  />
                )}
              </button>

              {/* Group Items */}
              {!mini && (
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="ml-4 pl-3 border-l border-border/40 space-y-0.5 py-1">
                    {items.map(({ to, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          cn(
                            "block px-3 py-1.5 rounded-md text-sm transition-colors",
                            "hover:bg-accent/50",
                            isActive
                              ? "text-foreground font-medium bg-accent/30"
                              : "text-muted-foreground hover:text-foreground"
                          )
                        }
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
