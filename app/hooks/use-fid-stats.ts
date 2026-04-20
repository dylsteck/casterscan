import { useQuery } from "@tanstack/react-query";
import { CACHE_TTLS } from "../lib/utils";
import { apiClient } from "../lib/api-client";

interface FidStats {
  casts: number;
  reactions: number;
  links: number;
  verifications: number;
}

export function useFidStats(fid: string) {
  return useQuery({
    queryKey: ["fid-stats", fid],
    queryFn: async (): Promise<FidStats> => apiClient.getFidStats(fid),
    enabled: !!fid,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    gcTime: CACHE_TTLS.REACT_QUERY.GC_TIME,
  });
}
