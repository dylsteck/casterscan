'use client'

import { useQuery } from '@tanstack/react-query'

export type InfoData = {
  dbStats: {
    numMessages: number
    numFidRegistrations: number
    approxSize: number
  }
  numShards: number
  shardInfos: Array<{
    shardId: number
    maxHeight: number
    numMessages: number
    numFidRegistrations: number
    approxSize: number
    blockDelay: number
    mempoolSize: number
  }>
  version: string
  peer_id: string
  nextEngineVersionTimestamp: number
}

export function useInfo() {
  const query = useQuery({
    queryKey: ['snapchain-info'],
    queryFn: async (): Promise<InfoData> => {
      const response = await fetch('/api/snapchain/info')
      if (!response.ok) {
        throw new Error('Failed to fetch snapchain info')
      }
      return response.json()
    },
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
  })

  // Return backward compatible interface
  return {
    info: query.data,
    isLoading: query.isLoading,
    error: query.error
  }
}
