import { useQuery } from '@tanstack/react-query';
import type { NeynarV2User } from 'shared/dist';
import { SERVER_URL } from '@/lib/constants';

export function useNeynarUser(fid: string) {
  return useQuery({
    queryKey: ['neynar-user', fid],
    queryFn: async (): Promise<NeynarV2User> => {
      const response = await fetch(`${SERVER_URL}/api/fids/${fid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    enabled: !!fid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
