import { useQuery } from '@tanstack/react-query';
import type { AppWithSigners } from '../lib/signer-helpers';
import { CACHE_TTLS } from '../lib/utils';
import { apiClient } from '../lib/api-client';

export function useAppsWithSigners(fid: string) {
  return useQuery({
    queryKey: ['apps-with-signers', fid],
    queryFn: async (): Promise<AppWithSigners[]> => {
      const appsData = (await apiClient.getSignersEnriched(fid)) as (Omit<AppWithSigners, "lastUsed"> & { lastUsed?: string | null })[];
      
      return appsData.map((app) => ({
        ...app,
        lastUsed: app.lastUsed ? new Date(app.lastUsed) : undefined,
      }));
    },
    enabled: !!fid,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    gcTime: CACHE_TTLS.REACT_QUERY.GC_TIME,
    refetchOnWindowFocus: false,
  });
}
