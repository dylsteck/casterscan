import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '~/utils/api';
import { getRelativeTime } from '../lib/time';
import localData from '../lib/localData.json';

const Gallery: React.FC = () => {
  const isProd = false;
  const queryResult = isProd ? api.casts.getLatestCasts.useQuery(
    { limit:30 },
    { refetchOnWindowFocus: false } // for development
  ) : { data: { casts: localData.casts } }; 
  return (
    <div className="w-screen lg:w-full flex flex-wrap mt-[5vh] text-white">
      {queryResult.data?.casts.map((cast, index) => (
        <div key={cast.text.length / cast.author_fid} className={`w-full md:w-1/2 lg:w-1/3 ${index % 3 !== 0 ? 'border-l border-white' : ''}`}>
          <Link href={`casts/${cast.hash as string}`}>
              <div className={`border-t border-white ${index === 0 ? 'pt-1' : ''} p-2`}>
                <div className="flex items-center p-2">
                  <Image src={cast.author_pfp_url as string} alt={`@${cast.author_username as string}'s PFP`} width={20} height={20} className="rounded-full w-6 h-6" />
                  <p className="ml-3">@{cast.author_username}</p>
                  <div className="ml-auto text-sm group">
                    <p className='group-hover:text-transparent'>{getRelativeTime(new Date(cast.published_at))}</p>
                    <p className='absolute t-0 r-0  text-transparent group-hover:text-inherit'>{new Date(cast.published_at).toUTCString()}</p>
                  </div>
                </div>
                <p className="p-3">{cast.text}</p>
              </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
