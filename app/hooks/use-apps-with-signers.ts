import { useQuery } from '@tanstack/react-query';
import { AppWithSigners } from '../lib/signer-helpers';
import { CACHE_TTLS } from '../lib/utils';

export function useAppsWithSigners(fid: string) {
  return useQuery({
    queryKey: ['apps-with-signers', fid],
    queryFn: async (): Promise<AppWithSigners[]> => {
      const response = await fetch(`/api/farcaster/${fid}/signers-enriched`);
      if (!response.ok) throw new Error('Failed to fetch enriched signers');
      
      const appsData = await response.json();
      
      return appsData.map((app: any) => ({
        ...app,
        lastUsed: app.lastUsed ? new Date(app.lastUsed) : undefined,
      }));
    },
    enabled: !!fid,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    gcTime: CACHE_TTLS.REACT_QUERY.GC_TIME,
  });
}
