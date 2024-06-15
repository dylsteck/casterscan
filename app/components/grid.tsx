import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

interface Cast {
  hash: string;
  parentHash: string | null;
  parentUrl: string | null;
  rootParentUrl: string | null;
  threadHash: string;
  parentAuthor: {
    fid: number | null;
  };
  author: {
    fid: number;
    custodyAddress: string;
    username: string;
    displayName: string;
    pfp: {
      url: string;
    };
    profile: {
      bio: {
        text: string;
        mentionedProfiles: any[];
      };
    };
    followerCount: number;
    followingCount: number;
    verifications: string[];
    verifiedAddresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    activeStatus: string;
    powerBadge: boolean;
  };
  text: string;
  timestamp: string;
  embeds: {
    url: string;
  }[];
  mentionedProfiles: any[];
  reactions: {
    count: number;
    fids: number[];
  };
  recasts: {
    count: number;
    fids: number[];
  };
  recasters: any[];
  replies: {
    count: number;
  };
}

interface ListRowProps {
  cast: Cast;
  isFirst: boolean;
}

const ListRow = ({ cast, isFirst }: ListRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rowRef.current) {
      rowRef.current.animate(
        [
          { opacity: 0 },
          { opacity: 1 },
        ],
        {
          duration: 300,
          easing: 'ease-in-out',
          fill: 'forwards',
        }
      );
    }
  }, []);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minutes ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days ago`;
    }
  };

  return (
    <div ref={rowRef} className={`border border-gray-300 p-4 flex flex-col justify-between h-full ${isFirst ? '' : 'border-t-0'}`}>
      <div>
        <div className="flex items-center mb-2">
          <img src={cast.author.pfp.url} alt={`${cast.author.username}'s PFP`} className="w-6 h-6 rounded-full mr-2" />
          <Link href={`https://warpcast.com/${cast.author.username}`} className="text-black font-medium">{cast.author.username}</Link>
        </div>
        <p className="text-gray-800 break-words">{cast.text}</p>
      </div>
      <div className="mt-2 flex justify-between items-end">
        <Link href={`/casts/${cast.hash}`} className="text-[#71579E] underline">link =&gt;</Link>
        <p className="text-gray-500 text-sm">{getRelativeTime(cast.timestamp)}</p>
      </div>
    </div>
  );
};

interface ListProps {
  casts: Cast[];
}

const Grid = ({ casts }: ListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-r border-gray-300">
      {casts.map((cast, index) => (
        <ListRow cast={cast} isFirst={index === 0} key={index} />
      ))}
    </div>
  );
};

export default Grid;