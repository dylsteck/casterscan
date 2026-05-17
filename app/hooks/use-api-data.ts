import { useQuery } from '@tanstack/react-query';
import { CACHE_TTLS } from '../lib/utils';
import { apiClient } from '../lib/api-client';

export const useFarcasterCast = (hash: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['farcaster-cast', hash],
    queryFn: async () => apiClient.getFarcasterCast(hash),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useHypersnapHubCast = (fid: number, hash: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['hypersnap-hub-cast', fid, hash],
    queryFn: async () => apiClient.getSnapchainCast(fid.toString(), hash, 'hypersnap'),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useFarcasterHubCast = (fid: number, hash: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['farcaster-hub-cast', fid, hash],
    queryFn: async () => apiClient.getSnapchainCast(fid.toString(), hash, 'farcaster'),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
