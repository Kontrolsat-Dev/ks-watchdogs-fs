// features/payments/queries.ts

import { useQuery } from "@tanstack/react-query";
import { prestashopClient } from "@/api/prestashop";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const started = performance.now();
      const data = await prestashopClient.getPayments();
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}
