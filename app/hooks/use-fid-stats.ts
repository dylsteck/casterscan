import { useQuery } from '@tanstack/react-query';
import { CACHE_TTLS } from '../lib/utils';

interface FidStats {
  casts: number;
  reactions: number;
  links: number;
  verifications: number;
}

export function useFidStats(fid: string) {
  return useQuery({
    queryKey: ['fid-stats', fid],
    queryFn: async (): Promise<FidStats> => {
      const endpoints = [
        `/api/farcaster/${fid}/casts`,
        `/api/farcaster/${fid}/reactions`,
        `/api/farcaster/${fid}/links`,
        `/api/farcaster/${fid}/verifications`
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => 
          fetch(endpoint)
            .then(res => res.ok ? res.json() : { messages: [] })
            .catch(() => ({ messages: [] }))
        )
      );

      const [castsData, reactionsData, linksData, verificationsData] = responses;

      return {
        casts: castsData.messages?.length || 0,
        reactions: reactionsData.messages?.length || 0,
        links: linksData.messages?.length || 0,
        verifications: verificationsData.messages?.length || 0,
      };
    },
    enabled: !!fid,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    gcTime: CACHE_TTLS.REACT_QUERY.GC_TIME,
  });
}
