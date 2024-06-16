'use client';
import React from 'react';
import Link from 'next/link';
import CasterscanIcon from './casterscan-icon';
import Search from './search';

export default function Header() {
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
      <Search />
    </>
  );
};