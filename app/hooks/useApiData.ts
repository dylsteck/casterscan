import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '../lib/utils';

// Hook for Farcaster API cast data
export const useFarcasterCast = (hash: string) => {
  return useQuery({
    queryKey: ['farcaster-cast', hash],
    queryFn: async () => {
      const response = await fetch(`/api/farcaster/cast?hash=${hash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Farcaster cast');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook for Neynar Hub cast data
export const useNeynarHubCast = (fid: number, hash: string) => {
  return useQuery({
    queryKey: ['neynar-hub-cast', fid, hash],
    queryFn: async () => {
      const response = await fetch(`/api/snapchain/cast?fid=${fid}&hash=${hash}&type=neynar`);
      if (!response.ok) {
        throw new Error('Failed to fetch Neynar Hub cast');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook for Farcaster Hub cast data
export const useFarcasterHubCast = (fid: number, hash: string) => {
  return useQuery({
    queryKey: ['farcaster-hub-cast', fid, hash],
    queryFn: async () => {
      const response = await fetch(`/api/snapchain/cast?fid=${fid}&hash=${hash}&type=farcaster`);
      if (!response.ok) {
        throw new Error('Failed to fetch Farcaster Hub cast');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Generic hook for any API endpoint
export const useApiCall = (endpoint: string, queryKey: string[], enabled = true) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${endpoint}`);
      }
      return response.json();
    },
    enabled,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1,
  });
}; 