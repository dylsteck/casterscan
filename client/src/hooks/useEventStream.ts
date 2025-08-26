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
    console.log('🔍 useEventStream effect - SERVER_URL:', SERVER_URL);
    console.log('🔍 Environment check - hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
    console.log('🔍 Environment check - NODE_ENV:', process.env.NODE_ENV);
    if (!SERVER_URL) {
      console.log('❌ No SERVER_URL, not starting stream');
      return;
    }

    console.log('🔗 Starting SSE connection:', `${SERVER_URL}/api/events/stream?stream=true`);
    
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
          console.log('📡 SSE connection opened');
          setIsConnected(true);
          setError(null);
          retryCount = 0; // Reset retry count on successful connection
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📡 SSE message received:', data.type);
            
            if (data.type === 'connected') {
              console.log('📡 SSE stream confirmed connected:', data.message);
              return;
            }
            
            if (data.type === 'error') {
              console.error('📡 SSE stream error:', data.error);
              setError(data.error);
              
              // If it's a gRPC fallback error, immediately switch to polling
              if (data.fallback) {
                console.log(`🏭 ${data.platform || 'Production'} gRPC failed, switching to polling immediately`);
                console.log('🔄 Environment details:', data.environment, data.platform);
                setConnectionMethod('polling');
                eventSource?.close();
                startPolling();
              }
              return;
            }
            
            if (data.type === 'cast' && data.id && data.content) {
              console.log('📡 Adding SSE cast to UI:', data.id.substring(0, 8), 'by', data.username);
              
              setEvents(prev => {
                // Avoid duplicates by checking ID
                if (prev.some(e => e.id === data.id)) {
                  return prev;
                }
                return [data, ...prev.slice(0, 49)]; // Keep last 50 events
              });
            }
            else if (data.type === 'heartbeat') {
              console.log('📡 SSE heartbeat received');
            }
          } catch (parseError) {
            console.error('❌ Error parsing SSE data:', parseError);
          }
        };
        
        eventSource.onerror = (event) => {
          console.error('❌ SSE connection error:', event);
          setIsConnected(false);
          
          if (eventSource?.readyState === EventSource.CLOSED) {
            console.log('📡 SSE connection closed by server');
            
            // Attempt to reconnect with exponential backoff
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = getRetryDelay(retryCount - 1);
              setError(`Connection lost, retrying in ${Math.ceil(delay/1000)}s... (${retryCount}/${maxRetries})`);
              
              console.log(`⏳ SSE reconnecting in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
              
              retryTimeout = setTimeout(() => {
                connectSSE();
              }, delay);
            } else {
              console.error(`❌ Max SSE retries (${maxRetries}) reached, falling back to polling`);
              setConnectionMethod('polling');
              setError('Connection failed, using polling mode');
              startPolling();
            }
          } else if (eventSource?.readyState === EventSource.CONNECTING) {
            // Connection is still trying, give it more time in production
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
        console.error('❌ Error creating SSE connection:', err);
        setError('Failed to create connection');
        setIsConnected(false);
      }
    };
    
    const startPolling = () => {
      isPollingActive = true;
      
      const pollEvents = async () => {
        while (isPollingActive && connectionMethod === 'polling') {
          try {
            console.log('📡 Polling for new events (fallback mode)...');
            
            const response = await fetch(`${SERVER_URL}/api/events/stream?limit=5&wait=3000`);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.events && data.events.length > 0) {
              console.log(`📡 Got ${data.events.length} new events from polling`);
              
              data.events.forEach((eventWrapper: any) => {
                if (eventWrapper.type === 'event' && eventWrapper.data) {
                  const eventData = eventWrapper.data;
                  console.log('📡 Adding polling event to UI:', eventData.type, eventData.username);
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
            console.error('❌ Polling error:', err);
            setIsConnected(false);
            setError('Polling failed');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      };
      
      pollEvents();
    };
    
    // Try SSE first, fall back to polling if it fails
    const isLocalhost = window.location.hostname === 'localhost';
    const isProduction = !isLocalhost;
    
    if (isProduction) {
      console.log('🏭 Production environment detected');
      console.log('🔄 Attempting SSE connection with polling fallback ready');
    }
    
    if (connectionMethod === 'sse') {
      connectSSE();
    } else {
      startPolling();
    }
    
    return () => {
      console.log('🔌 Cleaning up connections');
      
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