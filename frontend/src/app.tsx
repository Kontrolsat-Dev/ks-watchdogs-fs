// src/App.tsx
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {ThemeProvider} from "@/providers/theme-provider";
import {ToasterProvider} from "@/providers/toaster-provider";
import HomePage from "@/features/home";
import AppShell from "@/layout/AppShell"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>

                <ThemeProvider defaultTheme="system">
                    <AppShell/>

                    <ToasterProvider/>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                    </Routes>

                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
