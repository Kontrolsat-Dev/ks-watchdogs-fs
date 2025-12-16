// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "./layout/AppLayout";

// Pages
import HomePage from "@/features/home";
// --- Orders
import OrdersDelayedPage from "@/features/orders/delayed";
// --- Payments
import PaymentsPage from "@/features/payments";
// --- Products
import ProductsEolPage from "@/features/products/eol";
import SystemRunsPage from "./features/system/runs";
import PagesSpedPage from "./features/pages/speed";
import CartsAbandonedPage from "./features/carts/abadoned";
import KpiOrdersPerformancePage from "./features/kpi/orders/performance";
import KpiOrdersTimeseriesPage from "./features/kpi/orders/timeseries";
import LoginPage from "./features/auth/login";
import RequireAuth from "./layout/PublicLayout";

// Tools
// --- PDA
import PdaPage from "./features/pda";
// --- Patife
import PatifeHealthzPage from "./features/patife";
import KpiStoreFrontMetricsPage from "./features/kpi/orders/store";
// --- 404
import NotFoundPage from "./features/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
          <Toaster position="bottom-right" richColors />
          <Routes>
            {/* Público */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protegido */}
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                {/* Prestashop */}
                <Route path="/prestashop/payments" element={<PaymentsPage />} />
                <Route
                  path="/prestashop/orders/delayed"
                  element={<OrdersDelayedPage />}
                />
                <Route
                  path="/prestashop/carts/abandoned"
                  element={<CartsAbandonedPage />}
                />
                <Route
                  path="/prestashop/products/eol"
                  element={<ProductsEolPage />}
                />
                <Route
                  path="/prestashop/pages/loading"
                  element={<PagesSpedPage />}
                />
                {/* PDA */}
                <Route path="/pda" element={<PdaPage />} />
                {/* Patife */}
                <Route path="/patife" element={<PatifeHealthzPage />} />
                {/* KPI */}
                <Route
                  path="/kpi/orders/performance"
                  element={<KpiOrdersPerformancePage />}
                />
                <Route
                  path="/kpi/orders/timeseries"
                  element={<KpiOrdersTimeseriesPage />}
                />
                <Route
                  path="/kpi/store/performance"
                  element={<KpiStoreFrontMetricsPage />}
                />
                {/* System */}
                <Route path="/system/runs" element={<SystemRunsPage />} />
                
                {/* 404 - Catch all */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
