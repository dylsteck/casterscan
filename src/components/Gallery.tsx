import React, { useState } from 'react';
import Filters from './Filters';
import { api } from '~/utils/api';
import type { Database } from '~/types/database.t';
import { useRouter } from 'next/router';
import GalleryRender from './GalleryRender';

const Gallery: React.FC<{user: string}> = ({user}) => {
    const [sort, setSort] = useState<string>('Date')
    const [filter, setFilter] = useState<string>('Casts')
    const router = useRouter();

    const searchParam = router.query.q;
    const page = router.query.page as string | undefined;
    
    const queryResult = searchParam 
    ? (
        api.casts.getCastsByKeyword.useQuery(
          { keyword: searchParam as string },
          { refetchOnWindowFocus: false } // for development
        )
    ) : user.length > 0 
      ? (
          api.casts.getCastsByUsername.useQuery(
            { username: user, startRow: (parseInt(page as string) - 1) * 30 || 0 },
            { refetchOnWindowFocus: false } // for development
          )
      ) : (
            api.casts.getLatestCasts.useQuery(
              { startRow: (parseInt(page as string) - 1) * 30 || 0 },
              { refetchOnWindowFocus: false } // for development
            )
      );

    const profilesQueryResult = api.user.getLatestProfiles.useQuery(
      { limit: 30 },
      { refetchOnWindowFocus: false } // for development
    );

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

    const handleNextPage = async () => {
      const segments = router.asPath.split('?page=');
      if (segments.length < 2) {
        const nextPagePath = router.asPath + '?page=2';
        await router.push(nextPagePath);
        return;
      }

      const nextPagePath = `${segments[0] || ''}?page=${parseInt(segments[1] || '0', 10) + 1}`;
      await router.push(nextPagePath);
    };

  return (
    <div className='flex flex-col'>
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
      <div className="columns-3 gap-0 mt-[5vh] text-white">
      {queryResult?.data?.casts && (filter === 'Casts' || filter === 'Casts + Replies') ? sortCasts(queryResult.data.casts).map((cast: Database['public']['Tables']['casts']['Row'], index: number) => (        
        <GalleryRender key={`cast-${cast.hash}`} cast={cast} index={index} />
      )) : filter === 'Profiles' && profilesQueryResult?.data?.profiles ? sortProfiles(profilesQueryResult?.data?.profiles).map((profile: Database['public']['Tables']['profile']['Row'], index: number) => (
        <GalleryRender key={`profile-${profile.id}`} profile={profile} index={index} />
      )) : null}
      </div>


     <div className='flex flex-row self-center'>

       <button type="button" className="
        text-purple-900 font-bold
        rounded-md p-1
        hover:bg-purple-600
        border-2
        border-transparent hover:border-purple-800
        transition-colors ease-in-out duration-500
       " 
       onClick={() => router.back()}>
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
        </svg>
       </button>

       <button
        type="button"
        className="
              text-purple-900 font-bold
              rounded-md p-1
              hover:bg-purple-600
              border-2
              border-transparent hover:border-purple-800
              transition-colors ease-in-out duration-500
            "
        onClick={() => {
          try {
            void handleNextPage()
          } catch (e) {
            console.log("Error while paginating:", e);
          }
        }}
      >
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
       </button>
     </div>
    </div>
  );
};
export default Gallery;
