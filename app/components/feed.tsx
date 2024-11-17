/* eslint-disable @next/next/no-img-element */
'use client';
import useSWR from 'swr';
import axios from 'axios';
import React from 'react';
import List from './list';
import Grid from './grid';
import LoadingTable from './loading-table';
import LiveIndicatorIcon from './icons/live-indicator-icon';
import { type NeynarV1Cast, type User } from '../lib/types';

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data.result;
};

export default function Feed() {
  const [casts, setCasts] = React.useState<NeynarV1Cast[]>([]);
  const [currentCursor, setCurrentCursor] = React.useState<string | null>(null);
  const [previousCursors, setPreviousCursors] = React.useState<string[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>('list');

  const { data, error } = useSWR(
    `/api/neynar/recent-casts?limit=75${currentCursor ? `&cursor=${currentCursor}` : ''}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  React.useEffect(() => {
    if (data && data.casts && Array.isArray(data.casts)) {
      const parsedCasts: NeynarV1Cast[] = data.casts.map((cast: NeynarV1Cast) => {
        return {
          ...cast, 
          author: cast.author as User
        };
      });
      setCasts(parsedCasts);
      if (data.next && data.next.cursor) {
        setNextCursor(data.next.cursor);
      }
    }
  }, [data]);

  React.useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setFilter('grid');
    }
  }, []);

  const handleFilterChange = (input: string) => {
    if (filter !== input) {
      setFilter(input);
    }
  };

  const handleSetPage = (back: boolean) => {
    if (back) {
      const prevCursor = previousCursors.pop();
      setPreviousCursors([...previousCursors]);
      setCurrentCursor(prevCursor || null);
    } else {
      if (nextCursor) {
        setPreviousCursors([...previousCursors, currentCursor!]);
        setCurrentCursor(nextCursor);
      }
    }
  };

  if (error) return <div>Failed to load casts</div>;
  if (!data && casts.length === 0) return <LoadingTable />;

  return (
    <div className="w-screen h-screen">
      <div className="mt-2 border-b-2 border-[#C1C1C1] min-h-[5vh] max-h-[10vh]">
        <div className="ml-4 flex flex-row gap-2 float-left items-center">
          <p>LIVE FEED</p>
          <LiveIndicatorIcon />
        </div>
        <div className="ml-4 flex flex-row gap-1 float-left">
          <p className={`${filter === 'list' ? 'font-bold' : 'font-normal'} cursor-pointer`} onClick={() => handleFilterChange('list')}>list</p>
          <p>|</p>
          <p className={`${filter === 'grid' ? 'font-bold' : 'font-normal'} cursor-pointer`} onClick={() => handleFilterChange('grid')}>grid</p>
        </div>
        <div className="mr-6 float-right flex flex-row gap-3">
          <p className="cursor-pointer" onClick={() => handleSetPage(true)}>{`<=`}</p>
          <p className="cursor-pointer" onClick={() => handleSetPage(false)}>{`=>`}</p>
        </div>
      </div>
      {data ? (
        filter === 'list' ? (
          <List casts={casts} />
        ) : (
          <Grid casts={casts} />
        )
      ) : (
        <LoadingTable />
      )}
      {casts && casts.length === 0 && (
        <p className="text-center relative text-black/20 text-7xl pt-[10%]">
          no casts or replies
        </p>
      )}
    </div>
  );
}