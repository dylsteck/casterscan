import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Gallery from '../../components/Gallery';
import TableRow from '../../components/TableRow';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { getTimeDifference } from '../../lib/time';

import {
  ArrowPathRoundedSquareIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const CastByHash = () => {

  const router = useRouter();
  const { hash } = router.query;
  const queryResult = api.casts.getCastByHash.useQuery(
  { hash: hash },
  { enabled: true }
);

  return (
    <>
      { queryResult.isFetching ? "Loading" : (
        !queryResult.isSuccess ? "Invalid Hash" : (
        <div className="h-screen flex flex-col md:flex-row">
          <div className="border-r border-white mt-[1.25vh] w-full md:w-1/3">
            <div className="pt-[3.5vh] p-5">
               <div className="flex items-center">
               </div>
               <p className="ml-auto text-sm float-right text-md">Cast</p>
               <p className="text-2xl">{queryResult.data.cast.text}</p>
            </div>
            <TableRow 
                field="Cast Hash" 
                image={false} 
                result={queryResult.data.cast.hash} />
            <TableRow 
                field="Casted By" 
                image={true} 
                imageUrl={queryResult.data.cast.author_pfp_url} 
                imageAlt={`@${queryResult.data.cast.author_username}'s PFP'`} 
                result={`${queryResult.data.cast.author_display_name} · @${queryResult.data.cast.author_username}`} />
            <TableRow 
                field="Casted At" 
                image={false} 
                result={new Date(queryResult.data.cast.published_at).toLocaleString()} />
            <TableRow 
                field="Likes" 
                image={false} 
                result={queryResult.data.cast.reactions_count} />
            <TableRow 
                field="Recasts" 
                image={false} 
                result={queryResult.data.cast.recasts_count}
                field="Replies" 
                image={false} 
                result={queryResult.data.cast.replies_count} />
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