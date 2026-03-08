import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SnapchainEvent } from '../lib/types';
import { BASE_URL, CACHE_TTLS } from '../lib/utils';

interface EventsResponse {
  events: SnapchainEvent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export const useEvents = (page: number = 0, limit: number = 50) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['events', page, limit],
    queryFn: async (): Promise<EventsResponse> => {
      const response = await fetch(`${BASE_URL}/api/events?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 10000
  });

  return {
    ...query,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  };
}

// Hook for infinite scrolling (for future enhancement)
export const useInfiniteEvents = (limit: number = 50) => {
  // This can be implemented later if needed for infinite scrolling
  // using useInfiniteQuery from TanStack Query
}; 