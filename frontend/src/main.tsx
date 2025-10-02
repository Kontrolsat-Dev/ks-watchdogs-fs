import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import AppRouter from "@/router"
import { QueryProvider } from "@/providers/query-client"
import { ThemeProvider } from "@/providers/theme-provider"
import { ToasterProvider } from "@/providers/toaster-provider"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="watchdogs-theme">
            <QueryProvider>
                <ToasterProvider />
                <AppRouter />
            </QueryProvider>
        </ThemeProvider>
    </StrictMode>
)
