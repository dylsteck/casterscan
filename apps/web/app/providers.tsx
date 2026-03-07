'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Enable background refetching for live updates
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            // More aggressive refetching for live feed
            refetchInterval: (query) => {
              // Events query gets more frequent updates
              if (query.queryKey[0] === 'events') {
                return 5000; // 5 seconds for events - faster loading
              }
              // Other queries less frequent
              return 60000; // 1 minute for cast data
            },
            staleTime: 2000, // Consider data stale after 2 seconds for faster updates
            // Retry failed requests
            retry: (failureCount, error) => {
              // Don't retry if it's a 4xx error
              if (error instanceof Error && error.message.includes('4')) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Add mutation defaults if needed
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {children}
      </NuqsAdapter>
    </QueryClientProvider>
  );
} 