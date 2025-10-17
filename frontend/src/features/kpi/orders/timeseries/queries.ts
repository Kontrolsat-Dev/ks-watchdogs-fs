// src/features/kpi/employees/queries.ts
import { useQuery } from "@tanstack/react-query";
import { kpiClient } from "@/api/kpi";
import type { EmployeeRole, Granularity } from "@/api/kpi";

export function useKpiTimeseries(params: {
  role: EmployeeRole;
  gran: Granularity;
  since: string;
  until: string;
}) {
  return useQuery({
    queryKey: ["kpi", "employees", "timeseries", params],
    queryFn: async () => {
      const started = performance.now();
      const data = await kpiClient.getOrdersProcessingTimeseries(params);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    staleTime: 55_000,
    refetchInterval: 60_000,
  });
}
