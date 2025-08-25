'use client';

import React from 'react';
import Link from 'next/link';
import { sdk } from '@farcaster/miniapp-sdk';
import CasterscanIcon from './icons/casterscan-icon';
import Search from './search';
import { FrameLink } from './frame-link';
import { useFrameContext } from './frame-provider';

export default function Header() {
  const { context } = useFrameContext();

  const handleAddMiniApp = async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      console.error('Failed to add mini app:', error);
    }
  };

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
          {context && (
            <button onClick={handleAddMiniApp} className="cursor-pointer">
              <p>ADD MINIAPP</p>
            </button>
          )}
          <Link href="https://github.com/dylsteck/casterscan" target="_blank">
            <p>GITHUB</p>
          </Link>
        </div>
      </div>
      <Search />
    </>
  );
};