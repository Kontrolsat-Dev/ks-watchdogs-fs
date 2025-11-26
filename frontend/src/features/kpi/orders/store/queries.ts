import { useQuery } from "@tanstack/react-query";
import { kpiClient } from "@/api/kpi";

export function useKpiStoreFrontMetrics(params: {
  since: string; // DD-MM-YYYY
}) {
  return useQuery({
    queryKey: ["kpi", "store", "performance", params],
    queryFn: async () => {
      const started = performance.now();
      const data = await kpiClient.getStoreFrontMetrics(params);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    staleTime: 55_000,
    refetchInterval: 60_000,
  });
}
