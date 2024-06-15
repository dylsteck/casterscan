'use client';
import React from 'react';
import Link from 'next/link';
import CasterscanIcon from './casterscan-icon';

export default function Header(){
   const [search, setSearch] = React.useState('');
   const inputRef = React.useRef(null);

   return (
    <>
      <div className="text-black flex justify-between items-center border-b-2 border-[#C1C1C1]">
        <div className="float-left flex flex-row gap-3 ml-5 items-center">
          <CasterscanIcon />
          <Link href="/">
            <p>CASTERSCAN</p>
          </Link>
        </div>
        <div className="float-right flex flex-row gap-3 p-5">
          <Link href="https://warpcast.com/~/add-cast-action?url=https://casterscan.com/frames/actions/inspect-cast" target="_blank">
            <p>CAST ACTION</p>
          </Link>
          <Link href="https://github.com/dylsteck/casterscan" target="_blank">
            <p>GITHUB</p>
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