"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { CLIENTS } from '../lib/utils';
import { NeynarV2Cast, type Client } from '../lib/types';

type ShareCastProps = {
  neynarCast: NeynarV2Cast
}

export default function ShareCast({ neynarCast }: ShareCastProps) {
  const [selectedOption, setSelectedOption] = React.useState<Client>(CLIENTS.find((client) => client.name === "Warpcast") ?? CLIENTS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const options = CLIENTS.map(client => client.name.toLowerCase());

  const getIcon = (option: Client) => {
    const client = CLIENTS.find(client => client.name.toLowerCase() === option.name.toLowerCase());
    return client ? client.icon : null;
  };

  const getLink = (option: Client) => {
    const client = CLIENTS.find(client => client.name.toLowerCase() === option.name.toLowerCase());
    if(client?.name.toLowerCase() === "warpcast") {
      return `${client.castLink}${neynarCast.author.username}/${neynarCast?.hash.slice(0, 10)}`
    }
    return client ? client.castLink + (neynarCast?.hash || '') : "#";
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
                setSelectedOption(CLIENTS.find((client) => client.name.toLowerCase() === option) ?? CLIENTS[0]);
                setIsDropdownOpen(false);
              }}
            >
              view on {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}