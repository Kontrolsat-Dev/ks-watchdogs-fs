import { useState } from "react";
import Topbar from "@/layout/Topbar";
import { Outlet, NavLink as RRLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator.tsx";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile: fechado por omissão

  return (
    <div
      className={cn(
        "min-h-dvh grid bg-gradient-to-br from-background to-muted",
        sidebarOpen ? "md:grid-cols-[240px_1fr]" : "md:grid-cols-[0_1fr]"
      )}
    >
      {/* Overlay no mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (gaveta) */}
      <aside
        className={cn(
          // mobile: gaveta fixa à esquerda
          "fixed inset-y-0 left-0 z-20 w-72 border-r bg-background shadow-lg transition-transform md:static md:w-auto md:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          // em ecrãs >= md, quando “fechada”, encolhe a coluna
          !sidebarOpen && "md:-ml-[240px]"
        )}
        aria-hidden={!sidebarOpen && typeof window !== "undefined"}
      >
        <div className="p-4">
          <div className="mb-4 flex gap-2 items-center">
            <img src="./logo.png" alt="watchdogs" width={20} />
            <h1 className="font-semibold">Watchdogs</h1>
          </div>
          <nav className="grid gap-1">
            <NavLink to={"/"}>Dashboard</NavLink>
            <Separator />
            <NavLink to={"/payments"}>Métodos de Pagamento</NavLink>
            <NavLink to={"/orders/delayed"}>Encomendas Atrasadas</NavLink>
            <NavLink to={"/products/eol"}>Produtos EOL</NavLink>
          </nav>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={sidebarOpen}
        />
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <RRLink
      to={to}
      className={({ isActive }) =>
        cn(
          "px-3 py-2 rounded-lg text-sm hover:bg-accent",
          isActive && "bg-accent"
        )
      }
    >
      {children}
    </RRLink>
  );
}
