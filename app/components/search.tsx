'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { getNeynarCast } from '@/app/lib/server';

export default function Search(){
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const clearLocalState = () => {
    setSearch('');
    setLoading(false);
    setError(null);
  }

  const handleSearch = async () => {
    if (!search) return;

    setError(null);

    try {
      const isHash = /^0x[a-fA-F0-9]{40}$/.test(search);
      const isFarcasterUrl = search.includes('farcaster.xyz/');
      let cast;
      if (isHash) {
        cast = await getNeynarCast(search, 'hash');
      } else if (isFarcasterUrl) {
        cast = await getNeynarCast(search, 'url');
      } else {
        throw new Error('Invalid cast identifier');
      }

      if (cast && cast.hash) {
        clearLocalState();
        router.push(`/casts/${cast.hash}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
      {error && (
        <div className="text-red-500 p-2 ml-2 mb-2">
          <button className="font-medium mr-2.5 p-0.5" onClick={clearLocalState}>Dismiss</button> {error}
        </div>
      )}
    </div>
  );
}