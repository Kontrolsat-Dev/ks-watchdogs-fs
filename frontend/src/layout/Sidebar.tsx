// src/layout/Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Store,
  ChevronDown,
  ToolCase,
  Truck,
  ChartSpline,
  Globe,
  MonitorCog,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  collapsed: boolean; // AGORA: colapsa grupos (não a largura)
  mobileOpen: boolean; // gaveta em < md
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
    icon: ToolCase,
    items: [
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
    icon: ChartSpline,
    items: [
      { to: "/kpi/orders/performance", label: "Perfomance Encomendas" },
      { to: "/kpi/orders/timeseries", label: "Timeseries Encomendas" },
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
    icon: MonitorCog,
    items: [{ to: "/system/runs", label: "Logs de Analises" }],
  },
];

const GROUPS_KEY = "sidebar_groups_v1";

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const location = useLocation();

  // helpers
  const allFalse = useMemo(
    () =>
      Object.fromEntries(NAV_ITEMS.map((g) => [g.name, false])) as Record<
        string,
        boolean
      >,
    []
  );

  // lê guardado ou default = todos fechados
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

  // estado de open por grupo
  const [open, setOpen] = useState<Record<string, boolean>>(() => readSaved());

  // persistência
  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(open));
  }, [open]);

  // ao mudar de rota, abre o grupo correspondente (se estiver fechado)
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

  // "collapsed" agora fecha/abre TODOS os grupos (sem mexer na largura)
  useEffect(() => {
    if (collapsed) {
      setOpen({ ...allFalse });
    } else {
      // restaurar últimos abertos do storage + garantir grupo ativo aberto
      const restored = readSaved();
      for (const g of NAV_ITEMS) {
        const active = g.items.some((i) => location.pathname.startsWith(i.to));
        if (active) restored[g.name] = true;
      }
      setOpen(restored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  const toggleGroup = (name: string) =>
    setOpen((m) => ({ ...m, [name]: !m[name] }));

  const groupIsActive = (g: NavGroup) =>
    g.items.some((i) => location.pathname.startsWith(i.to));

  return (
    <aside
      role="navigation"
      aria-label="Navegação principal"
      className={cn(
        "fixed md:static inset-y-0 left-0 z-40 h-full md:h-screen border-r",
        "bg-background/70 supports-[backdrop-filter]:bg-background/30 backdrop-blur-xl",
        "transition-transform duration-200 ease-in-out",
        "w-72 md:w-64", // largura fixa
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Cabeçalho */}
      <div className="h-14 px-3 flex items-center gap-3 border-b">
        <img src="/logo.png" alt="watchdogs" className="h-5 w-5 ms-2" />
        <span className="font-semibold tracking-wider truncate text-lg">
          Watchdogs
        </span>
      </div>

      {/* Navegação */}
      <nav className="p-2 space-y-1 overflow-auto h-[calc(100%-3.5rem)] sidebar-scroll">
        {/* Dashboard */}
        <NavLink
          to="/"
          end
          onClick={onCloseMobile}
          className={({ isActive }) =>
            cn(
              "relative flex items-center rounded-md px-3 py-2 text-sm font-medium mb-2 transition-colors outline-none",
              "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-accent text-accent-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary opacity-0 transition-opacity",
                  isActive && "opacity-100"
                )}
              />
              <LayoutDashboard className="h-5 w-5" />
              <span className="ml-2">Dashboard</span>
            </>
          )}
        </NavLink>

        {/* Grupos */}
        {NAV_ITEMS.map((group) => {
          const { name, icon: Icon, items } = group;
          const isOpen = open[name];
          const isGrpActive = groupIsActive(group);
          const contentId = `group-${name.replace(/\s+/g, "-").toLowerCase()}`;

          return (
            <div key={name} className="mb-1">
              <div
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 transition-colors justify-between",
                  isGrpActive && "bg-accent/50 text-accent-foreground"
                )}
                aria-label={name}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn("h-5 w-5", isGrpActive && "text-primary")}
                  />
                  <h2
                    className={cn(
                      "text-sm font-medium",
                      isGrpActive && "text-foreground"
                    )}
                  >
                    {name}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleGroup(name)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  aria-label={isOpen ? `Recolher ${name}` : `Expandir ${name}`}
                  className="h-8 w-8"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </Button>
              </div>

              <div
                id={contentId}
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
                aria-hidden={!isOpen}
              >
                <div className="overflow-hidden">
                  {items.map(({ to, label }) => (
                    <NavLink
                      to={to}
                      key={to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          "relative ml-3 flex items-center rounded-md px-3 py-2 text-sm font-medium mb-1 transition-colors outline-none",
                          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
                          isActive && "bg-accent text-accent-foreground"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary opacity-0 transition-opacity",
                              isActive && "opacity-100"
                            )}
                          />
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
