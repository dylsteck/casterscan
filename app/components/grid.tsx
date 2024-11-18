import Link from 'next/link';
import React from 'react';
import { type NeynarV1Cast, type User } from '../lib/types';
import { renderCastText } from '../lib/utils';

const ListRow = ({ cast, isFirst }: { cast: NeynarV1Cast, isFirst: boolean }) => {
  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
    if(diffInSeconds === 0){
      return 'just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    }
  };

  return (
    <div ref={rowRef} className={`border border-gray-300 p-4 flex flex-col justify-between h-full ${isFirst ? '' : 'border-t-0'}`}>
      <div>
        <div className="flex items-center mb-2">
          <img src={(cast.author as any).avatar_url ?? ""} alt={`${(cast.author as any).fname ?? ""}'s PFP`} className="w-6 h-6 rounded-full mr-2" />
          <Link href={`https://warpcast.com/${(cast.author as any).fname ?? ""}`} className="text-black font-medium">{(cast.author as any).fname ?? ""}</Link>
        </div>
        <p className="text-gray-800 break-words">{renderCastText(cast.text)}</p>
      </div>
      <div className="mt-2 flex justify-between items-end">
        <Link href={`/casts/${cast.hash}`} className="text-[#71579E] underline">link =&gt;</Link>
        <p className="text-gray-500 text-sm">{getRelativeTime(cast.timestamp)}</p>
      </div>
    </div>
  );
};

const Grid = ({ casts }: { casts: NeynarV1Cast[]}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-r border-gray-300">
      {casts.map((cast, index) => (
        <ListRow cast={cast} isFirst={index === 0} key={index} />
      ))}
    </div>
  );
};

export default Grid;