"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CLIENTS } from '../lib/utils';
import { NeynarV2Cast, type Client } from '../lib/types';
import { useFrameContext } from './frame-provider';
import { FrameLink } from './frame-link';

type ShareCastProps = {
  neynarCast: NeynarV2Cast
}

const AVAILABLE_CLIENTS = CLIENTS.filter((client) => client.castLink.length > 0);

export default function ShareCast({ neynarCast }: ShareCastProps) {
  const { context } = useFrameContext();
  const clientFid = context?.client?.clientFid;
  
  const matchedClient = clientFid ? CLIENTS.find(client => client.fid === clientFid) : undefined;
  
  const [selectedOption, setSelectedOption] = React.useState<Client>(
    matchedClient || 
    AVAILABLE_CLIENTS.find((client) => client.name === "Warpcast") || 
    AVAILABLE_CLIENTS[0]
  );
  
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showDropdown = !matchedClient;

  const getIcon = (option: Client) => {
    const client = AVAILABLE_CLIENTS.find(client => client.name.toLowerCase() === option.name.toLowerCase());
    return client ? client.icon : null;
  };

  const getLink = (option: Client) => {
    const client = AVAILABLE_CLIENTS.find(client => client.name.toLowerCase() === option.name.toLowerCase());
    if (client?.name.toLowerCase() === "warpcast") {
      return `${client.castLink}${neynarCast.author.username}/${neynarCast?.hash.slice(0, 10)}`;
    }
    return client ? client.castLink + (neynarCast?.hash || '') : "#";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <FrameLink 
        href={getLink(selectedOption)} 
        className={`flex items-center gap-1.5 ${showDropdown ? 'bg-white border rounded-md px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-colors' : 'p-1.5 rounded-md'}`}
      >
        {!showDropdown ? (
          <div className="flex items-center gap-2">
            {getIcon(selectedOption)}
          </div>
        ) : (
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }} 
            className="flex items-center gap-2"
          >
            {getIcon(selectedOption)}
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-500"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </FrameLink>

      {showDropdown && isDropdownOpen && (
        <div className="absolute right-0 mt-1 w-[180px] bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {AVAILABLE_CLIENTS.map((client, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setSelectedOption(client);
                setIsDropdownOpen(false);
              }}
            >
              {client.icon}
              <span>{client.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}