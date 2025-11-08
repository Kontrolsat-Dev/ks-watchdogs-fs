// features/system/home/queries.ts
import { useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { homeClient } from "@/api/home";
import type { HomeSummary } from "@/api/home";

function defaultRefetchInterval(window: string) {
  const w = window.toLowerCase();
  return w === "6h" || w === "24h" ? 60_000 : 300_000; // curto: 1 min, longo: 5 min
}

export function useHomeSummary(window: string) {
  const refetchEvery = useMemo(() => defaultRefetchInterval(window), [window]);

  return useQuery<HomeSummary>({
    queryKey: ["home", "summary", window],
    queryFn: () => homeClient.getHomeSummary({ window }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: refetchEvery,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}
