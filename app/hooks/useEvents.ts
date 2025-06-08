import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { SnapchainEvent } from '../lib/types';
import { BASE_URL } from '../lib/utils';

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
  const prevEventsRef = useRef<SnapchainEvent[]>([]);

  const query = useQuery({
    queryKey: ['events', page, limit],
    queryFn: async (): Promise<EventsResponse> => {
      const response = await fetch(`${BASE_URL}/api/events?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Detect new events for animation purposes
  const newEvents = useRef<SnapchainEvent[]>([]);
  
  useEffect(() => {
    if (query.data?.events && prevEventsRef.current.length > 0) {
      const currentEventIds = new Set(prevEventsRef.current.map(e => e.id));
      const freshEvents = query.data.events.filter(event => !currentEventIds.has(event.id));
      
      if (freshEvents.length > 0) {
        newEvents.current = freshEvents;
        // Clear the new events after a short delay
        setTimeout(() => {
          newEvents.current = [];
        }, 2000);
      }
    }
    
    if (query.data?.events) {
      prevEventsRef.current = query.data.events;
    }
  }, [query.data?.events]);

  return {
    ...query,
    newEvents: newEvents.current,
    // Helper function to manually trigger a refresh
    refresh: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  };
}

// Hook for infinite scrolling (for future enhancement)
export const useInfiniteEvents = (limit: number = 50) => {
  // This can be implemented later if needed for infinite scrolling
  // using useInfiniteQuery from TanStack Query
}; 