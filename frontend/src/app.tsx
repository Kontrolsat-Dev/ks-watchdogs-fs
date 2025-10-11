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
import DelayedOrdersPage from "@/features/orders/delayed";
// import PaymentsPage from "@/features/payments"; // exemplos

// import ProductsEolPage from "@/features/products/Eol";

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
              {/* Orders  */}
              <Route path="/orders/delayed" element={<DelayedOrdersPage />} />
              {/* <Route path="/payments" element={<PaymentsPage />} /> */}
              {/* <Route path="/products/eol" element={<ProductsEolPage />} /> */}
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
