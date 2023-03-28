import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Filters from './Filters';
import { api } from '~/utils/api';
import { getRelativeTime } from '../lib/time';
import localData from '../lib/localData.json';
import type { FlattenedCast }  from '../types/indexer';


const Gallery: React.FC<{user: string}> = ({user}) => {
    const isProd = false;
    const [sort, setSort] = useState<string>('Date')
    const [filter, setFilter] = useState<string>('Casts')
    const queryResult = isProd ? api.casts.getLatestCasts.useQuery(
      { limit:30 },
      { refetchOnWindowFocus: false } // for development
    ) : { data: { casts: localData.casts } }; 

    const renderCastText = (text: string) => {
        const imgurRegex = /(https?:\/\/)?(www\.)?(i\.)?imgur\.com\/[a-zA-Z0-9]+(\.(jpg|jpeg|png|gif|bmp))?/g;
        const imgurMatches = text.match(imgurRegex);
        if (imgurMatches) {
          const textWithoutImgur = text.replace(imgurRegex, '').trim();
          return (
            <>
              <p>{textWithoutImgur}</p>
              {imgurMatches.map((match) => (
                <div key={match} className="mt-4 mb-4 flex justify-center">
                  <Image src={`${match}.png`} alt="imgur image" width={400} height={400} className="max-w-[30vw] max-h-[30vh] object-contain" />
                </div>
              ))}
            </>
          );
        }
        return <p>{text}</p>;
    };

    const handleChangeSort = (value: string) => {
        setSort(value)
    }

    const handleChangeFilter = (value: string) => {
        setFilter(value)
    }

    const sortCasts = (casts: FlattenedCast[]) => {
        if (sort === "Date") {
            return casts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        } else if (sort === "Trending") {
            return casts.sort((a, b) => {
                const aTrendFactor = a.reactions_count + a.recasts_count + a.replies_count;
                const bTrendFactor = b.reactions_count + b.recasts_count + b.replies_count;
                return bTrendFactor - aTrendFactor;
            });
        }
        return casts;
    }

  return (
  <>
    <Filters
        user={user}
        sort={sort}
        changeSort={handleChangeSort}
        filter={filter}
        changeFilter={handleChangeFilter}
    />
    <div className="w-screen lg:w-full flex flex-wrap mt-[5vh] text-white">
      {queryResult.data?.casts && sortCasts(queryResult.data.casts).map((cast: FlattenedCast, index: number) => (        
      <div 
            key={cast.text.length / cast.author_fid} 
            className={`w-full md:w-1/2 lg:w-1/3 hover:bg-purple-600 transition-colors duration-500`}>
            <div 
                className={`border-t-2 border-purple-800 ${index === 0 ? 'pt-1' : ''} p-2 border-l-2 border-purple-800 md:border-l-0 md:border-l md:border-l-0 h-full`} 
                style={{borderLeft: '2px solid #6b21a8'}}>
              <div 
                  className="flex items-center p-2">
                <Image 
                    src={cast.author_pfp_url as string} 
                    alt={`@${cast.author_username as string}'s PFP`} 
                    width={20} height={20} 
                    className="rounded-full w-6 h-6" />
                <p className="ml-3">@{cast.author_username}</p>
                <div className="relative ml-auto text-sm group min-w-[30ch] self-start text-gray-300">
                  <p className='absolute top-0 right-0 group-hover:text-transparent transition-colors duration-200'>
                      {getRelativeTime(new Date(cast.published_at))}
                  </p>
                  <p className='absolute top-0 right-0 text-transparent group-hover:text-inherit transition-colors duration-200 '>
                      {new Date(cast.published_at).toUTCString()}
                  </p>
                </div>
              </div>
              <Link href={`/casts/${cast.hash}`}>
                <p className="p-3 break-words justify-center">{renderCastText(cast.text)}</p>
              </Link>
            </div>
        </div>
      ))}
    </div>
  </>
  );
};

export default Gallery;
