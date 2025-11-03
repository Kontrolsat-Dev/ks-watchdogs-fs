// features/patife/queries.ts

import { useQuery } from "@tanstack/react-query";
import { toolsClient } from "@/api/tools";

export function usePatifeHealthz(params: { page: number; page_size: number }) {
  return useQuery({
    queryKey: ["patife", "healthz", params.page, params.page_size],
    queryFn: async () => {
      const started = performance.now();
      const data = await toolsClient.getHealthz(params);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}
