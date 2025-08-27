import { useState, useEffect } from 'react';
import { SERVER_URL } from '@/lib/constants';

export interface StreamEvent {
  id: string;
  username: string;
  content: string;
  link: string;
  time: string;
  type?: string;
  embeds?: string;
}

export function useEventStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'sse' | 'polling'>('sse');
  
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

  useEffect(() => {
    if (!SERVER_URL) {
      return;
    }
    
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 5;
    let retryTimeout: NodeJS.Timeout | null = null;
    let isPollingActive = false;
    
    const getRetryDelay = (attempt: number) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then cap at 16s
      return Math.min(1000 * Math.pow(2, attempt), 16000);
    };
    
    const connectSSE = () => {
      try {
        eventSource = new EventSource(`${SERVER_URL}/api/events/stream`);
        
        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          retryCount = 0;
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected' || data.type === 'ready' || data.type === 'heartbeat') {
              return;
            }
            
            if (data.type === 'streaming') {
              return;
            }
            
            if (data.type === 'error') {
              setError(data.error);
              // Switch to polling on SSE error in production
              if (isProduction) {
                setConnectionMethod('polling');
                return;
              }
            }
            
            if (data.type === 'cast' && data.id && data.content) {
              setEvents(prev => {
                if (prev.some(e => e.id === data.id)) {
                  return prev;
                }
                return [data, ...prev.slice(0, 49)];
              });
            }
          } catch (parseError) {
            // Silent fail
          }
        };
        
        eventSource.onerror = () => {
          setIsConnected(false);
          
          if (eventSource?.readyState === EventSource.CLOSED) {
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = getRetryDelay(retryCount - 1);
              setError(`Connection lost, retrying in ${Math.ceil(delay/1000)}s... (${retryCount}/${maxRetries})`);
              
              retryTimeout = setTimeout(() => {
                connectSSE();
              }, delay);
            } else {
              setConnectionMethod('polling');
              setError('Connection failed, using polling mode');
            }
          } else if (eventSource?.readyState === EventSource.CONNECTING) {
            if (isProduction && retryCount < 2) {
              retryCount++;
              const delay = getRetryDelay(retryCount - 1);
              setError(`Connecting... (${retryCount}/2)`);
              
              retryTimeout = setTimeout(() => {
                if (eventSource?.readyState !== EventSource.OPEN) {
                  eventSource?.close();
                  connectSSE();
                }
              }, delay);
            } else if (isProduction) {
              // In production, switch to polling faster
              setConnectionMethod('polling');
              setError('Switched to polling mode');
            }
          } else {
            if (retryCount >= 2 || isProduction) {
              setConnectionMethod('polling');
              setError('Connection failed, using polling mode');
            }
          }
        };
        
      } catch (err) {
        setError('Failed to create connection');
        setIsConnected(false);
        if (isProduction) {
          setConnectionMethod('polling');
        }
      }
    };
    
    const startPolling = () => {
      isPollingActive = true;
      
      const pollEvents = async () => {
        while (isPollingActive && connectionMethod === 'polling') {
          try {
            const response = await fetch(`${SERVER_URL}/api/events/recent?limit=10`);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.events && data.events.length > 0) {
              data.events.forEach((event: any) => {
                if (event.type === 'cast' && event.id && event.content) {
                  setEvents(prev => {
                    if (prev.some(e => e.id === event.id)) {
                      return prev;
                    }
                    return [event, ...prev.slice(0, 49)];
                  });
                }
              });
            }
            
            setIsConnected(true);
            setError(null);
            
            // Faster polling in production, slower in development
            const pollInterval = isProduction ? 2000 : 3000;
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            
          } catch (err) {
            setIsConnected(false);
            const errorMsg = err instanceof Error ? err.message : 'Polling failed';
            setError(isProduction ? 'Connection issue, retrying...' : errorMsg);
            await new Promise(resolve => setTimeout(resolve, isProduction ? 3000 : 5000));
          }
        }
      };
      
      pollEvents();
    };
    
    if (connectionMethod === 'sse') {
      connectSSE();
    } else {
      startPolling();
    }
    
    return () => {
      isPollingActive = false;
      
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [SERVER_URL, connectionMethod]);

  return { events, isConnected, error, connectionMethod };
}