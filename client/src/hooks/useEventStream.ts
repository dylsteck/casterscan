import { useState, useEffect } from 'react';
import { SERVER_URL } from '@/lib/constants';

export interface StreamEvent {
  id: string;
  username: string;
  content: string;
  link: string;
  time: string;
  type: string;
  embeds?: string;
}

export function useEventStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'sse' | 'polling'>('sse');

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
        eventSource = new EventSource(`${SERVER_URL}/api/events/stream?stream=true`);
        
        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          retryCount = 0;
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected' || data.type === 'connecting' || data.type === 'heartbeat') {
              return;
            }
            
            if (data.type === 'error') {
              setError(data.error);
              
              if (data.fallback) {
                setConnectionMethod('polling');
                eventSource?.close();
                startPolling();
              }
              return;
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
              startPolling();
            }
          } else if (eventSource?.readyState === EventSource.CONNECTING) {
            const isProduction = window.location.hostname !== 'localhost';
            if (isProduction && retryCount < maxRetries) {
              retryCount++;
              const delay = getRetryDelay(retryCount - 1);
              setError(`Connecting... (${retryCount}/${maxRetries})`);
              
              retryTimeout = setTimeout(() => {
                if (eventSource?.readyState !== EventSource.OPEN) {
                  eventSource?.close();
                  connectSSE();
                }
              }, delay);
            }
          } else {
            setError('Connection error');
          }
        };
        
      } catch (err) {
        setError('Failed to create connection');
        setIsConnected(false);
      }
    };
    
    const startPolling = () => {
      isPollingActive = true;
      
      const pollEvents = async () => {
        while (isPollingActive && connectionMethod === 'polling') {
          try {
            const response = await fetch(`${SERVER_URL}/api/events/stream?limit=5&wait=3000`);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.events && data.events.length > 0) {
              data.events.forEach((eventWrapper: any) => {
                if (eventWrapper.type === 'event' && eventWrapper.data) {
                  const eventData = eventWrapper.data;
                  setEvents(prev => {
                    if (prev.some(e => e.id === eventData.id)) {
                      return prev;
                    }
                    return [eventData, ...prev.slice(0, 49)];
                  });
                }
              });
            }
            
            setIsConnected(true);
            setError(null);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (err) {
            setIsConnected(false);
            setError('Polling failed');
            await new Promise(resolve => setTimeout(resolve, 5000));
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