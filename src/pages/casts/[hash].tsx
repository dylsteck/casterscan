import React from 'react';
import Gallery from '../../components/Gallery';
import TableRow from '../../components/TableRow';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import localData from '../../lib/localData.json';

const CastByHash = () => {

  const router = useRouter();
  const { hash } = router.query;
  const queryResult = api.casts.getCastByHash.useQuery({
    hash: hash as string 
  }, {
    enabled: true,
    refetchOnWindowFocus: false 
  });

  return (
    <>
      { queryResult.isFetching ? "Loading" : (
        !queryResult.isSuccess ? "Invalid Hash" : (
        <div className="h-screen flex flex-col md:flex-row text-white">
          <div className="border-r-2 border-purple-800 mt-[1.25vh] w-full md:w-1/3">
            <div className="pt-[3.5vh] p-5">
               <div className="flex items-center">
               </div>
               <p className="text-2xl">{queryResult.data?.cast?.text || ''}</p>
            </div>
            <TableRow 
              field="Cast Hash"
              image={false}
              result={queryResult.data?.cast?.hash as string} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Casted By" 
                image={true} 
                imageUrl={queryResult.data?.cast?.author_pfp_url as string || ''} 
                imageAlt={`@${queryResult.data?.cast?.author_username as string || ''}'s PFP`} 
                result={`${queryResult.data?.cast?.author_display_name as string || ''} · @${queryResult.data?.cast?.author_username as string || ''}`} />
            <TableRow 
                field="Casted At" 
                image={false} 
                result={queryResult.data?.cast ? new Date(queryResult.data.cast.published_at).toLocaleString() : ''} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Likes" 
                image={false} 
                result={String(queryResult.data?.cast?.reactions_count || 0)} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Recasts" 
                image={false} 
                result={String(queryResult.data?.cast?.recasts_count || 0)} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Replies" 
                image={false} 
                result={String(queryResult.data?.cast?.replies_count || 0)} imageUrl={''} imageAlt={''} />
          </div>
          <div className="w-2/3">
            <div className="pt-[3.5vh] p-5">
               <div className="flex items-center">
               </div>
               <p className="text-2xl">Recent Casts</p>
            </div>
            <Gallery />
          </div>
        </div>
      ))}
    </>
  )
}

export default CastByHash;
