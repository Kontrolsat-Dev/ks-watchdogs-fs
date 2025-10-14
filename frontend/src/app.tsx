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
            {/* Layout route */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              {/* Prestashop  */}
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
              {/* System */}
              <Route path="/system/runs" element={<SystemRunsPage />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
