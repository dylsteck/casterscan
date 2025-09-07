'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { getNeynarCast } from '@/app/lib/server';

export default function Search(){
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const clearLocalState = () => {
    setSearch('');
    setLoading(false);
  }

  const handleSearch = async () => {
    if (!search) return;

    setLoading(true);

    try {
      const isHash = /^0x[a-fA-F0-9]{40}$/.test(search);
      const farcasterUrlMatch = search.match(/^https?:\/\/(www\.)?farcaster\.xyz\/[^\/]+\/0x[a-fA-F0-9]{40}$/);
      const baseAppUrlMatch = search.match(/^https?:\/\/(www\.)?base\.app\/post\/0x[a-fA-F0-9]{40}$/);
      const isNumber = /^\d+$/.test(search);
      const isEventId = /^\d{6,}$/.test(search);
      const isUsername = /^[a-zA-Z][a-zA-Z0-9]*(\.(eth|base\.eth))?$/.test(search);

      if (isEventId) {
        clearLocalState();
        router.push(`/events/${search}`);
        return;
      }

      if (isNumber) {
        clearLocalState();
        router.push(`/fids/${search}`);
        return;
      }

      if (baseAppUrlMatch) {
        const hashMatch = baseAppUrlMatch[0].match(/0x[a-fA-F0-9]{40}/);
        if (hashMatch) {
          clearLocalState();
          router.push(`/casts/${hashMatch[0]}`);
          return;
        }
      }

      if (isUsername) {
        clearLocalState();
        router.push(`/usernames/${search}`);
        return;
      }

      let cast;
      if (isHash) {
        cast = await getNeynarCast(search, 'hash');
      } else if (farcasterUrlMatch) {
        cast = await getNeynarCast(search, 'url');
      } else {
        clearLocalState();
        router.push('/not-found');
        return;
      }

      if (cast && cast.hash) {
        clearLocalState();
        router.push(`/casts/${cast.hash}`);
      } else {
        clearLocalState();
        router.push('/not-found');
      }
    } catch (err) {
      clearLocalState();
      router.push('/not-found');
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="border-b-2 border-[#C1C1C1] justify-center">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="search"
        disabled={loading}
        className="text-black/20 text-7xl p-5 pl-4 pt-5 pb-5 focus:outline-none w-full"
      />
    </div>
  );
}