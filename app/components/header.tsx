'use client';
import React from 'react';
import Link from 'next/link';

export default function Header(){
   const [search, setSearch] = React.useState('');
   const inputRef = React.useRef(null);

   return (
    <>
      <div className="text-black flex justify-between items-center border-b-2 border-[#C1C1C1]">
        <Link className="float-left" href="/">
          <p className="p-5 pl-4">CASTERSCAN</p>
        </Link>
        <div className="float-right flex flex-row">
          {/* <p className="p-5 pl-4">
            ABOUT
          </p> */}
          <Link href="https://github.com/dylsteck/casterscan" target="_blank">
            <p className="p-5 pl-4 mr-2">GITHUB</p>
          </Link>
        </div>
      </div>
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-black/20 text-7xl p-5 pl-4 pt-5 pb-7 focus:outline-none w-full"
          placeholder="search"
          ref={inputRef}
        />
      </div>
    </>
  );
};