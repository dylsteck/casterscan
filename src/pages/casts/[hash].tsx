import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import Image from 'next/image';
import LiveFeed from '~/components/LiveFeed';
import CopyText from '~/components/CopyText';
import { addHyperlinksToText } from '~/lib/text';

const CastByHash = () => {

  const router = useRouter();
  const { hash } = router.query;
  const queryResult = api.casts.getCastByHash.useQuery(
    { hash: hash as string },
    { refetchOnWindowFocus: false}
  );
  
  return(
    <>
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <div className="p-5 pl-4 pt-5 pb-7 flex flex-row gap-4 items-center">
          {queryResult?.data?.cast.pfp && 
          <Image 
            src={queryResult?.data?.cast.pfp} 
            className="rounded-full w-[30px] h-[30px]"
            width={30} height={30} 
            alt={`${queryResult?.data?.cast.fname}'s PFP`} /> 
          }
          <div className="flex flex-col gap-2">
            <p className="text-black text-xl">
              {queryResult.isLoading ? 'Loading...' : queryResult?.data ? addHyperlinksToText(queryResult?.data?.cast.text) : 'Error: could not load cast text'}
            </p>
            {queryResult?.data?.cast.hash && 
              <p className="text-xs text-black/80 mt-2 w-[100%] flex flex-row gap-1">
                hash: <CopyText text={queryResult?.data?.cast.hash as string} />
              </p>
            }
          </div>
        </div>
      </div>
      <LiveFeed />
    </>
  )
}
export default CastByHash;
