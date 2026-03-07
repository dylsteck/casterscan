import { useQuery } from "@tanstack/react-query";
import { CACHE_TTLS } from "../lib/utils";

interface FidStats {
  casts: number;
  reactions: number;
  links: number;
  verifications: number;
}

export function useFidStats(fid: string) {
  return useQuery({
    queryKey: ["fid-stats", fid],
    queryFn: async (): Promise<FidStats> => {
      const res = await fetch(`/api/fid/${fid}/stats`);
      if (!res.ok) throw new Error("Failed to fetch fid stats");
      return res.json();
    },
    enabled: !!fid,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    gcTime: CACHE_TTLS.REACT_QUERY.GC_TIME,
  });
}
