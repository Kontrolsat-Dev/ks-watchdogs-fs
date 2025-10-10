// src/layout/AppShell.tsx
import Topbar from "@/layout/Topbar"
import {Outlet, NavLink as RRLink} from "react-router-dom"
import {cn} from "@/lib/utils"
import {Separator} from "@/components/ui/separator.tsx";

export default function AppShell() {
    return (
        <div className="min-h-dvh grid md:grid-cols-[240px_1fr]">
            <aside className="hidden md:block border-r">
                <div className="p-4">
                    <div className="font-semibold mb-4">Watchdogs</div>
                    <nav className="grid gap-1">
                        <NavLink to={"/"}>Dashboard</NavLink>
                        <Separator/>
                        <NavLink to={"/payments"}>Métodos de Pagamento</NavLink>
                        <NavLink to={"/orders/delayed"}>Encomendas Atrasadas</NavLink>
                        <NavLink to={"/products/eol"}>Produtos EOL</NavLink>
                    </nav>
                </div>
            </aside>

            <main className="">
                <Topbar/>
                <div className="p-4 md:p-6">
                    <Outlet/>
                </div>
            </main>
        </div>
    )
}

function NavLink({to, children}: { to: string; children: React.ReactNode }) {
    return (
        <RRLink
            to={to}
            className={({isActive}) =>
                cn("px-3 py-2 rounded-lg text-sm hover:bg-accent", isActive && "bg-accent")
            }
        >
            {children}
        </RRLink>
    )
}
