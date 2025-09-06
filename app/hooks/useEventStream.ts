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
        console.log('Raw event data:', { hash, fid, text: text?.substring(0, 50) })
        if (!hash || !text || !fid) return
        
        try {
          const userResponse = await fetch(`/api/users/${fid}`)
          const userData = await userResponse.json()
          const user = userData?.result?.user

          // Hash is now already a proper hex string from the API
          const hexHash = hash
          console.log('Processing hash:', { hexHash, type: typeof hexHash, length: hexHash?.length })
          // Use the hash directly - it should be a valid hex string from the API
          const uniqueId = hexHash || `cast-${fid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          const newEvent: StreamEvent = {
            id: uniqueId,
            username: user?.username || `fid${fid}`,
            content: text,
            embeds: '0', // Default to 0, could be enhanced later
            link: `/casts/${uniqueId}`,
            type: 'CAST_ADD',
            timestamp: new Date().toISOString(),
            fid: Number(fid),
          }

          setEvents(prev => [newEvent, ...prev.slice(0, 199)]) // Keep only latest 200 events
        } catch (userError) {
          console.warn('Failed to fetch user data for FID:', fid, userError)
          // Add event without user data
          // Hash is now already a proper hex string from the API
          const hexHash = hash
          console.log('Processing hash (error path):', { hexHash, type: typeof hexHash, length: hexHash?.length })
          // Use the hash directly - it should be a valid hex string from the API
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
        }
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
    }
  }, [])

  return {
    events,
    isConnected,
    error,
  }
}
