// features/pda/queries.ts

import { useQuery } from "@tanstack/react-query";
import { toolsClient } from "@/api/tools";

export function usePdaReports(params: { page: number; page_size: number }) {
  return useQuery({
    queryKey: ["pda", "reports", params.page, params.page_size],
    queryFn: async () => {
      const started = performance.now();
      const data = await toolsClient.getPdaReports(params);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
  });
}
