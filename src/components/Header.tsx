import React from 'react';

const Header: React.FC = () => {

  return (
    <>
      <div className="border-b-2 border-[#C1C1C1]">
        <p className="p-5 pl-4">CASTERSCAN</p>
      </div>
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <p className="text-black/20 text-7xl p-5 pl-4 pt-5 pb-7">search</p>
      </div>
    </>
  );
};

export default Header;
