"use client";
import React from 'react';
import Link from 'next/link';
import WarpcastIcon from '@/app/components/icons/warpcast-icon';
import SupercastIcon from './icons/supercast-icon';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface ShareCastProps {
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
  neynarCast: {
    author: {
      username: string;
      fid: number;
    };
    hash: string;
  } | null;
}

export default function ShareCast({ selectedOption, setSelectedOption, neynarCast }: ShareCastProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const options = ["view on warpcast", "view on supercast"];

  const getIcon = (option: string) => {
    switch(option) {
      case "view on warpcast":
        return (
          <WarpcastIcon className="ml-2 w-5 h-5" />
        );
      case "view on supercast":
        return (
          <SupercastIcon className="ml-2 w-5 h-5" />
        );
      default:
        return null;
    }
  };

  const getLink = (option: string) => {
    switch(option) {
      case "view on warpcast":
        return `https://warpcast.com/${neynarCast?.author.username}/${neynarCast?.hash.slice(0, 10)}`;
      case "view on supercast":
        return `https://supercast.xyz/c/${neynarCast?.hash}`;
      default:
        return "#";
    }
  };

  return (
    <div className="relative flex items-center border border-gray-300 py-1 px-2 rounded leading-tight">
      <ChevronDownIcon 
        className="w-5 h-5 mr-1 cursor-pointer" 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
      />
      <Link href={getLink(selectedOption)} target="_blank">
        {getIcon(selectedOption)}
      </Link>
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 min-w-[35vw] md:min-w-[20vw] bg-white border border-gray-300 rounded shadow-lg z-10">
          {options.map((option, index) => (
            <div 
              key={index} 
              className="px-4 py-2 cursor-pointer hover:bg-gray-200" 
              onClick={() => {
                setSelectedOption(option);
                setIsDropdownOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}