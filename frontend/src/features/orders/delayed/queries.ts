// features/orders/delayed/queries.ts

import { useQuery } from "@tanstack/react-query";
import { prestashopClient } from "@/api/prestashop";

export function useDelayedOrders() {
  return useQuery({
    queryKey: ["orders", "delayed"],
    queryFn: async () => {
      const started = performance.now();
      const data = await prestashopClient.getDelayedOrders();
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}
