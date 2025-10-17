import { useQuery } from "@tanstack/react-query";
import { kpiClient } from "@/api/kpi";

export function useKpiPerformance(params: {
  role: "prep" | "invoice";
  since: string; // DD-MM-YYYY
  until: string; // DD-MM-YYYY
  order_by: "avg" | "n" | "min" | "max";
  order_dir: "asc" | "desc";
  limit: number;
}) {
  return useQuery({
    queryKey: ["kpi", "employees", "performance", params],
    queryFn: async () => {
      const started = performance.now();
      const data = await kpiClient.getOrdersProcessingPerformance(params);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    staleTime: 55_000,
    refetchInterval: 60_000,
  });
}
