import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Store,
  ChevronDown,
  ToolCase,
  Truck,
  ChartSpline,
  Globe,
  MonitorCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  collapsed: boolean; // aplica-se a md+
  mobileOpen: boolean; // gaveta em < md
  onCloseMobile: () => void;
};

type NavItem = { to: string; label: string };
type NavItems = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: NavItem[];
};

const NAV_ITEMS: NavItems[] = [
  {
    name: "Prestashop",
    icon: Store,
    items: [
      { to: "/prestashop/payments", label: "Métodos de Pagamento" },
      { to: "/prestashop/orders/delayed", label: "Encomendas Atrasadas" },
      { to: "/prestashop/products/eol", label: "Produtos EOL" },
      { to: "/prestashop/pages/loading", label: "Carregamento Páginass" },
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
    items: [{ to: "/orders/processing", label: "Processamento Encomendas" }],
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

const Sidebar: React.FC<Props> = ({ collapsed, mobileOpen, onCloseMobile }) => {
  // estado aberto/fechado por grupo com persistência
  const initialOpen = useMemo<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(GROUPS_KEY) || "{}"
      ) as Record<string, boolean>;
      const base: Record<string, boolean> = {};
      NAV_ITEMS.forEach((g) => (base[g.name] = saved[g.name] ?? true));
      return base;
    } catch {
      const base: Record<string, boolean> = {};
      NAV_ITEMS.forEach((g) => (base[g.name] = true));
      return base;
    }
  }, []);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(open));
  }, [open]);

  const toggleGroup = (name: string) =>
    setOpen((m) => ({ ...m, [name]: !m[name] }));

  return (
    <aside
      className={cn(
        // base
        "fixed md:static inset-y-0 left-0 z-40 h-full md:h-screen border-r bg-background/80 supports-[backdrop-filter]:bg-background/80 transition-all duration-200 ease-in-out",
        // larguras
        "w-72 md:w-64", // mobile sempre w-72; desktop padrão w-64
        collapsed && "md:w-16", // se colapsado, desktop fica w-16
        // gaveta mobile
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      aria-hidden={
        !mobileOpen && typeof window !== "undefined" ? undefined : undefined
      }
    >
      {/* Cabeçalho */}
      <div className="h-14 px-3 flex items-center gap-3 border-b">
        <img
          src="/logo.png"
          alt="watchdogs"
          className={cn("h-5 w-5 ms-2", collapsed && "md:ms-3")}
        />
        <span
          className={cn(
            "font-semibold tracking-wider truncate text-lg",
            collapsed && "md:hidden"
          )}
        >
          Watchdogs
        </span>
      </div>

      <nav className="p-2 space-y-1 overflow-auto h-[calc(100%-3.5rem)]">
        {NAV_ITEMS.map(({ name, icon: Icon, items }) => {
          const isOpen = open[name];
          const contentId = `group-${name.replace(/\s+/g, "-").toLowerCase()}`;

          return (
            <div key={name} className="mb-1">
              {/* Linha do grupo */}
              <div
                className={cn(
                  "flex items-center rounded-md px-3 py-2",
                  collapsed ? "justify-center" : "justify-between"
                )}
                aria-label={name}
                title={collapsed ? name : undefined}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {!collapsed && (
                    <h2 className="text-md font-medium">{name}</h2>
                  )}
                </div>

                {/* Botão recolher/expandir (só visível quando expandido) */}
                {!collapsed && (
                  <Button
                    // type="button"
                    variant="link"
                    onClick={() => toggleGroup(name)}
                    // className="h-8 w-8 inline-grid place-items-center rounded-md border hover:bg-accent hover:text-accent-foreground"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    aria-label={
                      isOpen ? `Recolher ${name}` : `Expandir ${name}`
                    }
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </Button>
                )}
              </div>

              {/* Conteúdo do grupo com transição (grid-rows 0fr ↔ 1fr) */}
              <div
                id={contentId}
                // quando colapsado (sidebar), força fechado visualmente
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                  !collapsed && isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
                aria-hidden={collapsed || !isOpen}
              >
                <div className="overflow-hidden">
                  {/* Separador + itens */}
                  {items.map(({ to, label }) => (
                    <NavLink
                      to={to}
                      key={to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          "ml-3 flex items-center rounded-md px-3 py-2 text-sm font-medium mb-1 transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-accent text-accent-foreground"
                        )
                      }
                    >
                      <span>{label}</span>
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
};

export default Sidebar;
