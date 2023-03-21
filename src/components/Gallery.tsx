import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { getTimeDifference } from '../lib/time';

const Gallery: React.FC = () => {
  const { data: latestCasts, refetch } = api.casts.getLatestCasts.useQuery(
    { limit: 30 }, 
    { enabled: true }
  );

  // useEffect(() => {
  //   refetch();
  // }, []);
    
  return (
    <div className="w-screen lg:w-full flex flex-wrap mt-[5vh] text-white">
      {latestCasts?.casts.map((cast, index) => (
        <div key={cast.id} className={`w-full md:w-1/2 lg:w-1/3 ${index % 3 !== 0 ? 'border-l border-white' : ''}`}>
          <Link href={`casts/${cast.hash}`}>
              <div className={`border-t border-white ${index === 0 ? 'pt-1' : ''} p-2`}>
                <div className="flex items-center p-2">
                  <Image src={cast.author_pfp_url} alt={`@${cast.author_username}'s PFP`} width={20} height={20} className="rounded-full w-6 h-6" />
                  <p className="ml-3">@{cast.author_username}</p>
                  <p className="ml-auto text-sm">{getTimeDifference(cast.published_at)}</p>
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
