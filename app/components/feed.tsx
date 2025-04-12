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

  React.useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    let timeoutId: number;
    
    const connectEventSource = () => {
      if (eventSource) {
        eventSource.close();
      }
      
      eventSource = new EventSource(`${BASE_URL}/api/hub/stream`);
      
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.ping) return;
          
          const incoming = { ...data, timestamp: new Date().toISOString() };
          setCasts((prev) => [incoming, ...prev]);
          retryCount = 0;
        } catch (err) {
        }
      };
      
      eventSource.onerror = () => {
        eventSource?.close();
        
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        retryCount++;
        
        timeoutId = setTimeout(() => {
          connectEventSource();
        }, delay) as unknown as number;
      };
    };
    
    connectEventSource();
    
    return () => {
      eventSource?.close();
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
    <div className="w-screen h-screen">
      <div className="mt-2 border-b-2 border-[#C1C1C1] min-h-[5vh] max-h-[10vh]">
        <div className="ml-4 flex flex-row gap-2 float-left items-center">
          <p>LIVE FEED</p>
          <LiveIndicatorIcon />
        </div>
        <div className="ml-4 flex flex-row gap-1 float-left">
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