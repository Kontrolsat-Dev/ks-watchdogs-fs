import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ReactNode } from "react"

type Props = {
    children: ReactNode
    defaultTheme?: "system" | "light" | "dark"
    storageKey?: string
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "watchdogs-theme",
}: Props) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme={defaultTheme}
            enableSystem
            storageKey={storageKey}
        >
            {children}
        </NextThemesProvider>
    )
}
