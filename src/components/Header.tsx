import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useRef, useState } from 'react';
import { SearchContext } from '~/context/SearchContext';
import { db } from '~/lib/kysely';
import { api } from '~/utils/api';
import AboutPopup from './AboutPopup';

const Header: React.FC = () => {

  const router = useRouter();
  const inputRef = useRef(null);

  const notCastOrUser = router.pathname !== '/users/[username]' && router.pathname !== '/casts/[hash]';

  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [search, setSearch] = useState<string>('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleChangeSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }

  const handleKeyDown = async(e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchValue(search)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center border-b-2 border-[#C1C1C1]">
        <Link href="/" className="float-left">
          <p className="p-5 pl-4">CASTERSCAN</p>
        </Link>
        <div className="float-right flex flex-row">
          <p className="p-5 pl-4" onClick={() => handleOpenPopup()}>
            ABOUT
          </p>
          <AboutPopup isOpen={isPopupOpen} handleClose={handleClosePopup} />
          <Link href="https://github.com/dylsteck/casterscan">
            <p className="p-5 pl-4 mr-2">GITHUB</p>
          </Link>
        </div>
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