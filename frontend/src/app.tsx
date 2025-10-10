// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToasterProvider } from "@/providers/toaster-provider";
import HomePage from "@/features/home";
import AppShell from "@/layout/AppShell";
// import PaymentsPage from "@/features/payments"; // exemplos
// import DelayedOrdersPage from "@/features/orders/Delayed";
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
          <ToasterProvider />
          <Routes>
            {/* Layout route */}
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              {/* <Route path="/payments" element={<PaymentsPage />} /> */}
              {/* <Route path="/orders/delayed" element={<DelayedOrdersPage />} /> */}
              {/* <Route path="/products/eol" element={<ProductsEolPage />} /> */}
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
