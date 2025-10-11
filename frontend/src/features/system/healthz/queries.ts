//features/system/healthz/queries.ts

import { useQuery } from "@tanstack/react-query";
import { systemClient } from "@/api/system";

export function useHealthz() {
  return useQuery({
    queryKey: ["system", "healthz"],
    queryFn: async () => {
      const started = performance.now();
      const data = await systemClient.getHealthz();
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
