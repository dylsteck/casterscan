import Link from 'next/link';
import React from 'react';
import { type HubStreamCast, type User } from '../lib/types';
import { renderCastText } from '../lib/utils';
import { FrameLink } from './frame-link';

const ListRow = ({ cast, isFirst }: { cast: HubStreamCast, isFirst: boolean }) => {
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
        },
      );
    }
  }, []);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diffInSeconds === 0) {
      return 'just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  };

  return (
    <div ref={rowRef} className={`border border-gray-300 p-4 flex flex-col justify-between h-full ${isFirst ? '' : 'border-t-0'}`}>
      <div>
        <div className="flex items-center mb-2">
          {cast.author && cast.author.user ? (
            <>
              <img
                src={cast.author.user.pfp?.url || ''}
                alt={`${cast.author.user.username}'s PFP`}
                className="w-6 h-6 rounded-full mr-2"
              />
              <FrameLink
                href={`https://warpcast.com/${cast.author.user.username}`}
                className="text-black font-medium"
              >
                {cast.author.user.username}
              </FrameLink>
            </>
          ) : (
            <span className="text-black font-medium">Unknown user</span>
          )}
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

const Grid = ({ casts }: { casts: HubStreamCast[]}) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-r border-gray-300">
      {casts.map((cast, index) => (
        <ListRow cast={cast} isFirst={index === 0} key={index} />
      ))}
    </div>
);

export default Grid;
