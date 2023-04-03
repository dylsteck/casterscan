import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Filters from './Filters';
import { api } from '~/utils/api';
import { getRelativeTime } from '../lib/time';
import { Database } from '~/types/database.t';


const Gallery: React.FC<{user: string}> = ({user}) => {
    const [sort, setSort] = useState<string>('Date')
    const [filter, setFilter] = useState<string>('Casts')
    const queryResult = user.length > 0 
    ? api.casts.getCastsByUsername.useQuery(
      { username: user },
      { refetchOnWindowFocus: false } // for development
    )
    : api.casts.getLatestCasts.useQuery(
      { limit: 30 },
      { refetchOnWindowFocus: false } // for development
    );

    const profilesQueryResult = api.user.getLatestProfiles.useQuery(
      { limit:30 },
      { refetchOnWindowFocus: false } // for development
    );

    const renderCastText = (text: string) => {
      const imgurRegex = /(https?:\/\/)?(www\.)?(i\.)?imgur\.com\/[a-zA-Z0-9]+(\.(jpg|jpeg|png|gif|bmp))?/g;
      const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    
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
    
      const tokens = text.split(urlRegex);
      return (
        <p>
          {tokens.map((token, index) => {
            if (urlRegex.test(token)) {
              const url = token.startsWith('http') ? token : `http://${token}`;
              return (
                <Link key={index} href={url}>
                  {token}
                </Link>
              );
            }
            return token;
          })}
        </p>
      );
    };

    const handleChangeSort = (value: string) => {
        setSort(value)
    }

    const handleChangeFilter = (value: string) => {
        setFilter(value)
    }

    const sortCasts = (casts: Database['public']['Tables']['casts']['Row'][]) => {
      if (sort === 'Date') {
        return casts.sort(
          (a, b) =>
            new Date(b.published_at).getTime() -
            new Date(a.published_at).getTime()
        );
      } else if (sort === 'Trending') {
        return casts.sort((a, b) => {
          const aTrendFactor =
            (a.reactions_count || 0) +
            (a.recasts_count || 0) +
            (a.replies_count || 0);
          const bTrendFactor =
            (b.reactions_count || 0) +
            (b.recasts_count || 0) +
            (b.replies_count || 0);
          return bTrendFactor - aTrendFactor;
        });
      } else if (filter === 'Casts') {
        return casts.filter((cast) => cast.parent_hash === null);
      }
      return casts;
    };
    

    const sortProfiles = (profiles: Database['public']['Tables']['profile']['Row'][]) => {
      console.log(profiles.filter((profile) => profile.username !== null))
      return profiles.filter((profile) => profile.username !== null);
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
      {queryResult?.data?.casts && filter === 'Casts' ? sortCasts(queryResult.data.casts).map((cast: Database['public']['Tables']['casts']['Row'], index: number) => (        
      <div 
            key={cast.text.length / cast.author_fid} 
            className={`w-full md:w-1/2 lg:w-1/3 hover:bg-purple-600 transition-colors duration-500`}>
            <div 
                className={`border-t-2 border-purple-800 ${index === 0 ? 'pt-1' : ''} p-2 border-l-2 border-purple-800 md:border-l-0 h-full`} 
                style={{borderLeft: '2px solid #6b21a8'}}>
              <div 
                  className="flex items-center p-2">
                <Image 
                    src={cast.author_pfp_url as string} 
                    alt={`@${cast.author_username as string}'s PFP`} 
                    width={20} height={20} 
                    className="rounded-full w-6 h-6" />
                <Link href={`/users/${cast.author_username}`}>
                    <p className="ml-3">@{cast.author_username}</p>
                </Link>
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
      )) : filter === 'Profiles' && profilesQueryResult?.data?.profiles ? sortProfiles(profilesQueryResult?.data?.profiles).map((profile: Database['public']['Tables']['profile']['Row'], index: number) => (
        <div 
            key={profile?.owner?.length / profile?.bio?.length} 
            className={`w-full md:w-1/2 lg:w-1/3 hover:bg-purple-600 transition-colors duration-500`}>
            <div 
                className={`border-t-2 border-purple-800 ${index === 0 ? 'pt-1' : ''} p-2 border-l-2 border-purple-800 md:border-l-0 h-full`} 
                style={{borderLeft: '2px solid #6b21a8'}}>
              <div 
                  className="flex items-center p-2">
                {profile.avatar_url !== null && <Image 
                    src={profile.avatar_url as string} 
                    alt={`@${profile.username as string}'s PFP`} 
                    width={20} height={20} 
                    className="rounded-full w-6 h-6" />
                }
                {profile.username !== null && 
                <Link href={`/users/${profile.username}`}>
                    <p className="ml-3">@{profile.username}</p>
                </Link>
                }
                {/* <div className="relative ml-auto text-sm group min-w-[30ch] self-start text-gray-300">
                  <p className='absolute top-0 right-0 group-hover:text-transparent transition-colors duration-200'>
                      {getRelativeTime(new Date(profile.registered_at || ''))}
                  </p>
                  <p className='absolute top-0 right-0 text-transparent group-hover:text-inherit transition-colors duration-200 '>
                      {new Date(profile.registered_at || '').toUTCString()}
                  </p>
                </div> */}
              </div>
                <p className="p-3 break-words justify-center">{profile.bio !== null && renderCastText(profile.bio)}</p>
            </div>
        </div>
      )) : null}
      </div>
    </>
  );
};
export default Gallery;
