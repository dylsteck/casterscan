'use client';

import React from 'react';
import List from './list';
import Grid from './grid';
import LiveIndicatorIcon from './icons/live-indicator-icon';
import { HubStreamCast, type NeynarV1Cast, type User } from '../lib/types';
import { BASE_URL } from '../lib/utils';

export default function Feed() {
  const [casts, setCasts] = React.useState<HubStreamCast[]>([]);
  const [filter, setFilter] = React.useState('list');
  const [isConnected, setIsConnected] = React.useState(false);
  const eventSourceRef = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    let retryCount = 0;
    let timeoutId: number;
    let connectionAttempts = 0;
    const maxConnectionAttempts = 5;
    
    const connectEventSource = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Prevent infinite connection attempts
      if (connectionAttempts >= maxConnectionAttempts) {
        console.error("Max connection attempts reached. Stopping reconnection.");
        setIsConnected(false);
        return;
      }
      
      connectionAttempts++;
      console.log(`Attempting connection ${connectionAttempts}/${maxConnectionAttempts}`);
      
      eventSourceRef.current = new EventSource(`${BASE_URL}/api/hub/stream`);
      
      eventSourceRef.current.onopen = () => {
        console.log("EventSource connected successfully");
        setIsConnected(true);
        retryCount = 0;
        connectionAttempts = 0; // Reset on successful connection
      };
      
      eventSourceRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.ping) return;
          
          // Handle error messages from server
          if (data.error) {
            console.error("Server error:", data.error);
            return;
          }
          
          const incoming = { ...data, timestamp: new Date().toISOString() };
          setCasts((prev) => [incoming, ...prev.slice(0, 99)]);
        } catch (err) {
          console.error("Failed to parse message", err);
        }
      };
      
      eventSourceRef.current.onerror = (err) => {
        console.log("EventSource error:", err);
        setIsConnected(false);
        
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          eventSourceRef.current?.close();
          
          // Exponential backoff with jitter for production
          const baseDelay = 1000 * Math.pow(2, retryCount);
          const jitter = Math.random() * 1000;
          const delay = Math.min(baseDelay + jitter, 30000);
          retryCount++;
          
          console.log(`Reconnecting in ${Math.round(delay)}ms... (attempt ${retryCount})`);
          timeoutId = setTimeout(() => {
            connectEventSource();
          }, delay) as unknown as number;
        }
      };
    };
    
    connectEventSource();
    
    return () => {
      eventSourceRef.current?.close();
      clearTimeout(timeoutId);
    };
  }, []);

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setFilter('grid');
    }
  }, []);

  function handleFilterChange(layout: string) {
    if (filter !== layout) {
      setFilter(layout);
    }
  }

  return (
    <div className="w-screen h-screen overflow-x-hidden">
      <div className="py-2 border-b-2 border-[#C1C1C1] flex items-center">
        <div className="ml-4 flex flex-row gap-2 items-center">
          <p>LIVE FEED</p>
          <LiveIndicatorIcon status={isConnected ? 'connected' : 'disconnected'} />
        </div>
        <div className="ml-4 flex flex-row gap-1">
          <p
            className={`${filter === 'list' ? 'font-bold' : 'font-normal'} cursor-pointer`}
            onClick={() => handleFilterChange('list')}
          >
            list
          </p>
          <p>|</p>
          <p
            className={`${filter === 'grid' ? 'font-bold' : 'font-normal'} cursor-pointer`}
            onClick={() => handleFilterChange('grid')}
          >
            grid
          </p>
        </div>
      </div>
      {!casts.length && (
        <p className="text-center relative text-black/20 text-7xl pt-[10%]">no casts</p>
      )}
      {casts.length > 0 && (
        filter === 'list' ? <List casts={casts} /> : <Grid casts={casts} />
      )}
    </div>
  );
}