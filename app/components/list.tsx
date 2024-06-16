import Link from 'next/link';
import React from 'react';

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
}

const ListRow = ({ cast }: ListRowProps) => {
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
        <Link href={`https://warpcast.com/${cast.author.username}`}>{cast.author.username}</Link>
      </th>
      <td className="px-2 py-2 max-w-20">
        <p className="overflow-x-scroll">
          {cast.text}
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

interface ListProps {
  casts: Cast[];
}

const List = ({ casts }: ListProps) => {
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