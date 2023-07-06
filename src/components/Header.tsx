import React, { useContext } from 'react';
import { SearchContext } from '~/context/SearchContext';

const Header: React.FC = () => {

  const { searchValue, setSearchValue } = useContext(SearchContext);

  const handleChangeSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }

  return (
    <>
      <div className="border-b-2 border-[#C1C1C1]">
        <p className="p-5 pl-4">CASTERSCAN</p>
      </div>
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleChangeSearchValue(e)}
          className="text-black/20 text-7xl p-5 pl-4 pt-5 pb-7 focus:outline-none"
          placeholder="search"
        />
      </div>
    </>
  );
};

export default Header;
