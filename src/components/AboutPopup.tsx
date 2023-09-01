import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface AboutPopupProps {
  isOpen: boolean;
  handleClose: () => void;
}

const AboutPopup = ({ isOpen, handleClose }: AboutPopupProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const casterscans = "Casterscan's";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-[50vw] max-h-[50vh] overflow-y-scroll">
        <div className="w-[100%] flex flex-row justify-between items-center">
          <div className="flex flex-row items-center">
            <p className="text-lg font-medium pb-2">About</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center" style={{ height: '100%' }}>
              <XCircleIcon
                width={20}
                height={20}
                className="text-[#EA3323] cursor-pointer pb-1"
                onClick={handleClose}
              />
            </div>
          </div>
        </div>
        <p className="text-md mt-2">
            Casterscan is a block explorer for Farcaster. 
            It lets you view and query all casts & profiles, view channels, and see raw metadata you would otherwise have to run code to get.
            <br/> <br/>
            There are two goals for {casterscans} utility: <br/>
            - make it easy to access/query Farcaster data <br/>
            - give each atomic unit of data available on <Link href="https://www.thehubble.xyz/">Hubs</Link> its own URL, starting with casts and profiles

            <br /> <br />
            👇 Have any questions/comments about Casterscan or want to contribute? <br />
            - <Link href="https://github.com/dylsteck/casterscan">Roadmap</Link> <br />
            - <Link href="/users/casterscan">{casterscans} FC Account</Link> <br />
            - <Link href="https://t.me/dylsteck">Message Dylan</Link>

            <br /> <br /> <br/>
            <p>Hope you enjoy exploring Casterscan! <br /> <Link href="https://dylansteck.com">- Dylan</Link> </p>
        </p>
      </div>
    </div>,
    document.body
  );
};

export default AboutPopup;