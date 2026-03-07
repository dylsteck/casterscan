import { useQuery } from '@tanstack/react-query';
import { BASE_URL, CACHE_TTLS } from '../lib/utils';

export const useFarcasterCast = (hash: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['farcaster-cast', hash],
    queryFn: async () => {
      const response = await fetch(`/api/farcaster/cast?hash=${hash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Farcaster cast');
      }
      return response.json();
    },
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useNeynarHubCast = (fid: number, hash: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['neynar-hub-cast', fid, hash],
    queryFn: async () => {
      const response = await fetch(`/api/snapchain/cast?fid=${fid}&hash=${hash}&type=neynar`);
      if (!response.ok) {
        throw new Error('Failed to fetch Neynar Hub cast');
      }
      return response.json();
    },
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useFarcasterHubCast = (fid: number, hash: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['farcaster-hub-cast', fid, hash],
    queryFn: async () => {
      const response = await fetch(`/api/snapchain/cast?fid=${fid}&hash=${hash}&type=farcaster`);
      if (!response.ok) {
        throw new Error('Failed to fetch Farcaster Hub cast');
      }
      return response.json();
    },
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};