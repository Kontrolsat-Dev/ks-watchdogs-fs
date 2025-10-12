//features/system/runs/queries.ts

import { useQuery } from "@tanstack/react-query";
import { systemClient } from "@/api/system";

export function useSystemRuns() {
  return useQuery({
    queryKey: ["system", "runs"],
    queryFn: async () => {
      const started = performance.now();
      const data = await systemClient.getRuns();
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}
