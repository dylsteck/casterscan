import { useState } from 'react';
import { useLocation } from '@tanstack/react-router';

export function Search() {
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  return (
    <div className={`flex items-center gap-4 mb-4 px-4 pt-2 ${!isHomepage ? 'border-b border-gray-200 pb-4' : ''}`}>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="search"
        className="text-5xl font-light text-gray-400 bg-transparent border-none outline-none p-0 m-0 w-full placeholder:text-gray-400 placeholder:font-light"
        style={{ fontSize: '3.5rem' }}
      />
    </div>
  );
}
