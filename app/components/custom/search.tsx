'use client';
import React from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function Search(){
  const [search, setSearch] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const clearLocalState = () => {
    setSearch('');
    setLoading(false);
  }

  const handleSearch = async () => {
    if (!search) return;

    setLoading(true);

    try {
      const isHash = /^0x[a-fA-F0-9]{40}$/.test(search);
      const farcasterUrlMatch = search.match(/^https?:\/\/(www\.)?farcaster\.xyz\/[^/]+\/0x[a-fA-F0-9]{8,40}$/);
      const baseAppUrlMatch = search.match(/^https?:\/\/(www\.)?base\.app\/post\/0x[a-fA-F0-9]{40}$/);
      const isNumber = /^\d+$/.test(search);
      const isEventId = /^\d{10,}$/.test(search);
      const isUsername = /^[a-zA-Z][a-zA-Z0-9]*(\.(eth|base\.eth))?$/.test(search);

      if (isEventId) {
        clearLocalState();
        navigate({ to: `/events/${search}` });
        return;
      }

      if (isNumber) {
        clearLocalState();
        navigate({ to: `/fids/${search}` });
        return;
      }

      if (baseAppUrlMatch) {
        const hashMatch = baseAppUrlMatch[0].match(/0x[a-fA-F0-9]{40}/);
        if (hashMatch) {
          clearLocalState();
          navigate({ to: `/casts/${hashMatch[0]}` });
          return;
        }
      }

      if (isUsername) {
        clearLocalState();
        navigate({ to: `/usernames/${search}` });
        return;
      }

      if (isHash) {
        clearLocalState();
        navigate({ to: `/casts/${search}` });
        return;
      }

      if (farcasterUrlMatch) {
        const hashMatch = farcasterUrlMatch[0].match(/0x[a-fA-F0-9]{8,40}/);
        if (hashMatch) {
          clearLocalState();
          navigate({ to: `/casts/${hashMatch[0]}` });
          return;
        }
      }

      clearLocalState();
      navigate({ to: '/not-found' });
    } catch (err) {
      clearLocalState();
      navigate({ to: '/not-found' });
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
