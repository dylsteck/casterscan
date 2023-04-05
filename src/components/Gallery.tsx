import React, { useState } from 'react';
import Link from 'next/link';
import Filters from './Filters';
import { api } from '~/utils/api';
import { Database } from '~/types/database.t';
import { useRouter } from 'next/router';
import GalleryRender from './GalleryRender';

const Gallery: React.FC<{user: string}> = ({user}) => {
    const [sort, setSort] = useState<string>('Date')
    const [filter, setFilter] = useState<string>('Casts')
    const router = useRouter()
    const searchParam = router.query.q;

    const queryResult = searchParam 
    ? api.casts.getCastsByKeyword.useQuery(
        { keyword: searchParam as string },
        { refetchOnWindowFocus: false } // for development
      )
    : user.length > 0 
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

    const ExpandableImage = ({ imageUrl }) => {
      const [isExpanded, setIsExpanded] = useState(false);
    
      return (
        <div className="relative">
          <div
            className="max-w-[20ch] max-h-[20ch] object-contain cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <img src={`${imageUrl}.png`} alt="imgur image" width={400} height={400} />
          </div>
          {isExpanded && (
            <div
              className="fixed top-0 left-0 w-full h-full p-10 bg-black bg-opacity-50 flex justify-center items-center z-50"
              onClick={() => setIsExpanded(false)}
            >
              <img src={`${imageUrl}.png`} alt="imgur image" className="max-w-full max-h-full" />
            </div>
          )}
        </div>
      );
    };  

    const renderCastText = (text: string, hash: string) => {
      console.log("HASH", hash, hash.length);
      const imgurRegex = /(https?:\/\/)?(www\.)?(i\.)?imgur\.com\/[a-zA-Z0-9]+(\.(jpg|jpeg|png|gif|bmp))?/g;
      const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    
      const imgurMatches = text.match(imgurRegex);
      if (imgurMatches) {
        const textWithoutImgur = text.replace(imgurRegex, '').trim();
        return (
          <>
           {/* Still need to fix */}
            {hash.length > 0 ? (
              <div>
                <Link href={`/casts/${hash}`}>
                  <p>{textWithoutImgur}</p>
                </Link>
              </div>
            ) : (
              <><p>{textWithoutImgur}</p></>
            )}
            {imgurMatches.map((match, index) => (
              <div key={index} className="mt-4 mb-4 flex justify-center">
                <ExpandableImage imageUrl={match} />
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
        return casts.filter((cast) => cast.parent_hash !== null);
      }
      return casts;
    };    
    

    const sortProfiles = (profiles: Database['public']['Tables']['profile']['Row'][]) => {
      console.log(profiles.filter((profile) => profile.username !== null))
      return profiles.filter((profile) => profile.username !== null);
  }

  return (
    <main className="
      flex flex-col
      items-center justify-center
      min-h-fit
    ">
      <div className='self-start'>
        <Filters
            user={user}
            sort={sort}
            changeSort={handleChangeSort}
            filter={filter}
            changeFilter={handleChangeFilter}
        />
      </div>
      {queryResult.isLoading && 
        <svg className="mt-7 w-12 h-12 animate-spin text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      }
      <div className="w-full lg:w-full flex flex-wrap mt-[5vh] text-white">
      {queryResult?.data?.casts && (filter === 'Casts' || filter === 'Casts + Replies') ? sortCasts(queryResult.data.casts).map((cast: Database['public']['Tables']['casts']['Row'], index: number) => (        
        <GalleryRender cast={cast} index={index} />
      )) : filter === 'Profiles' && profilesQueryResult?.data?.profiles ? sortProfiles(profilesQueryResult?.data?.profiles).map((profile: Database['public']['Tables']['profile']['Row'], index: number) => (
        <GalleryRender profile={profile} index={index} />
      )) : null}
      </div>
    </main>
  );
};
export default Gallery;
