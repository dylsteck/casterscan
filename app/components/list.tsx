import Link from 'next/link';
import React from 'react';
import { type HubStreamCast, type User } from '../lib/types';
import { renderCastText } from '../lib/utils';

const ListRow = ({ cast }: { cast: HubStreamCast }) => {
  const rowRef = React.useRef<HTMLTableRowElement>(null);

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

  const checkImages = (): string[] => {
    const pattern = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/g;
    const imageLinks: string[] = [];

    let match;
    while ((match = pattern.exec(cast.text)) !== null) {
      imageLinks.push(match[0]);
    }
    if (cast.embeds) {
      cast.embeds.forEach((embed) => {
        while ((match = pattern.exec(embed.url ?? '')) !== null) {
          imageLinks.push(match[0]);
        }
      });
    }
    return imageLinks;
  };

  const images = checkImages();

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if(diffInSeconds === 0){
      return 'just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } 
  };

  return (
    <tr ref={rowRef} className="bg-white">
      <th
        scope="row"
        className="px-2 py-2 text-[#71579E] font-normal w-1/6"
      >
        <Link href={`https://warpcast.com/${cast.author.user.username}`}>{cast.author.user.username}</Link>
      </th>
      <td className="px-2 py-2 max-w-20">
        <p className="overflow-x-scroll">
          {renderCastText(cast.text)}
        </p>
      </td>
      <td className="px-2 py-2 w-1/6">
        {cast.embeds && cast.embeds.length > 0 && (
          <div className="flex items-center justify-center bg-gray-400 w-10 h-10 ml-2">
            <p className="text-center">{`+${cast.embeds.length}`}</p>
          </div>
        )}
      </td>
      <td className="px-2 py-2 w-1/6">
        <Link href={`/casts/${cast.hash}`}>
            <p className="underline text-[#71579E]">{`link =>`}</p>
        </Link>
      </td>
      <td className="px-2 py-2 w-1/6">
        {getRelativeTime(cast.timestamp)}
      </td>
    </tr>
  );
};

const List = ({ casts }: { casts: HubStreamCast[] }) => {
  return (
    <div className="overflow-x-auto w-full pl-2">
      <table className="min-w-full text-sm text-left table-fixed">
        <thead className="text-md text-[#494949] font-normal">
          <tr>
            <th scope="col" className="px-2 py-2 w-1/6">username</th>
            <th scope="col" className="px-2 py-2 w-2/6">content</th>
            <th scope="col" className="px-2 py-2 w-1/6">embeds</th>
            <th scope="col" className="px-2 py-2 w-1/6">link</th>
            <th scope="col" className="px-2 py-2 w-1/6">time</th>
          </tr>
        </thead>
        <tbody>
          {casts.map((cast, index) => (
            <ListRow cast={cast} key={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;