'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import useNeynarCast from '../hooks/neynar/use-neynar-cast';

const Search = () => {
  const [search, setSearch] = React.useState('');
  const [error, setError] = React.useState('');
  const [identifier, setIdentifier] = React.useState<string | null>(null);
  const inputRef = React.useRef(null);
  const router = useRouter();
  
  const { cast, loading, error: fetchError } = useNeynarCast(identifier ?? '', 'url');

  const clearLocalState = () => {
    setIdentifier(null);
    setSearch('');
    setError('');
  }

  React.useEffect(() => {
    if (identifier && cast) {
      clearLocalState();
      router.push(`/casts/${cast.hash}`);
    }
  }, [cast, identifier, router]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      const warpcastPattern = /^https:\/\/warpcast\.com\/[^\/]+\/0x[a-fA-F0-9]{8,10}$/;
      if (search.startsWith('0x')) {
        clearLocalState();
        router.push(`/casts/${search}`);
      } else if (warpcastPattern.test(search)) {
        const extractedIdentifier = search.split('/').pop();
        if (extractedIdentifier) {
          setIdentifier(search);
        } else {
          setError('Invalid Warpcast URL');
          setSearch('');
        }
      } else {
        setError('Input must start with a 0x hash or be a valid Warpcast cast URL');
        setSearch('');
      }
    }
  };
  
  return (
    <div className="border-b-2 border-[#C1C1C1] justify-center">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-black/20 text-7xl p-5 pl-4 pt-5 pb-5 focus:outline-none w-full"
        placeholder="search"
        ref={inputRef}
      />
      {error && (
        <div className="text-red-500 p-2 ml-2 mb-2">
        <button className="font-medium mr-2.5 p-0.5" onClick={clearLocalState}>Dismiss</button> {error}
        </div>
      )}
      {/* {loading && <p>Loading...</p>} */}
      {fetchError && <p>{fetchError}</p>}
    </div>
  );
};

export default Search;