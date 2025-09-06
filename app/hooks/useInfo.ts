'use client'

import { useState, useEffect } from 'react'

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
  const [info, setInfo] = useState<InfoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await fetch('/api/info')
        if (!response.ok) {
          throw new Error('Failed to fetch info')
        }
        const data = await response.json()
        setInfo(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfo()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchInfo, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { info, isLoading, error }
}
