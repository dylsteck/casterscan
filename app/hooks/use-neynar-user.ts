import { useQuery } from '@tanstack/react-query';
import { NeynarV2User } from '../lib/types';

export function useNeynarUser(fid: string) {
  return useQuery({
    queryKey: ['neynar-user', fid],
    queryFn: async (): Promise<NeynarV2User> => {
      const response = await fetch(`/api/users/${fid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      return data.result.user;
    },
    enabled: !!fid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
