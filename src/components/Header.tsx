import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useRef, useState } from 'react';
import { SearchContext } from '~/context/SearchContext';

const Header: React.FC = () => {

  const router = useRouter();
  const inputRef = useRef(null);

  const notCastOrUser = router.pathname !== '/users/[username]' && router.pathname !== '/casts/[hash]';

  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [search, setSearch] = useState<string>('');

  const handleChangeSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // alert("Enter key pressed!");
      setSearchValue(search)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center border-b-2 border-[#C1C1C1]">
        <Link href="/" className="float-left">
          <p className="p-5 pl-4">CASTERSCAN</p>
        </Link>
        <Link href="/dashboard" className="float-right">
          <p className="p-5 pl-4">DASHBOARD [+]</p>
        </Link>
      </div>
      {notCastOrUser && 
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          className="text-black/20 text-7xl p-5 pl-4 pt-5 pb-7 focus:outline-none"
          placeholder="search"
          ref={inputRef}
        />
      </div>
      }
    </>
  );
};

export default Header;
