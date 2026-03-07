'use client'

import { useQuery } from '@tanstack/react-query'
import { CACHE_TTLS } from '../lib/utils'

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
    refetchInterval: CACHE_TTLS.REACT_QUERY.REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    retry: 2,
  })

  // Return backward compatible interface
  return {
    info: query.data,
    isLoading: query.isLoading,
    error: query.error
  }
}
