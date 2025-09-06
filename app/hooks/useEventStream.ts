'use client'

import { useEffect, useState } from 'react'

export type StreamEvent = {
  id: string
  username: string
  content: string
  embeds?: string
  link: string
  type: string
  timestamp: string
  fid: number
}

export function useEventStream() {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/events?stream=true')
    
    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log('Connected to event stream')
    }
    
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.error) {
          setError(data.error)
          return
        }
        
        const { hash, fid, text } = data
        if (!hash || !text || !fid) return
        
        const hexHash = hash
        const uniqueId = hexHash || `cast-${fid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const newEvent: StreamEvent = {
          id: uniqueId,
          username: `fid${fid}`,
          content: text,
          embeds: '0',
          link: `/casts/${uniqueId}`,
          type: 'CAST_ADD',
          timestamp: new Date().toISOString(),
          fid: Number(fid),
        }

        setEvents(prev => [newEvent, ...prev.slice(0, 199)])
      } catch (parseError) {
        console.error('Failed to parse event data:', parseError)
      }
    }
    
    eventSource.onerror = (event) => {
      console.error('EventSource failed:', event)
      setIsConnected(false)
      setError('Connection lost')
    }
    
    return () => {
      eventSource.close()
      setIsConnected(false)
      console.log('Disconnected from event stream')
    }
  }, [])

  return {
    events,
    isConnected,
    error,
  }
}
