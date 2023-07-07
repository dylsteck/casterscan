import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { SearchContext } from '~/context/SearchContext';

const Header: React.FC = () => {

  const router = useRouter();

  const notCastOrUser = router.pathname !== '/users/[username]' && router.pathname !== '/casts/[hash]';

  const { searchValue, setSearchValue } = useContext(SearchContext);

  const handleChangeSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }

  return (
    <>
      <div className="border-b-2 border-[#C1C1C1]">
        <Link href="/">
          <p className="p-5 pl-4">CASTERSCAN</p>
        </Link>
      </div>
      {notCastOrUser && 
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleChangeSearchValue(e)}
          className="text-black/20 text-7xl p-5 pl-4 pt-5 pb-7 focus:outline-none"
          placeholder="search"
        />
      </div>
      }
    </>
  );
};

export default Header;
