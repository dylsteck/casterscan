import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import Image from 'next/image';
import LiveFeed from '~/components/LiveFeed';
import CopyText from '~/components/CopyText';
import { addHyperlinksToText } from '~/lib/text';
import { ExpandableImage } from '~/components/ExpandableImage';

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
        <div className="p-5 pl-4 pt-5 pb-7 flex flex-row gap-4 items-center align-top">
          {queryResult?.data?.cast.pfp && 
            <div className="w-[60px] h-[60px] flex items-center justify-center">
              <ExpandableImage 
                imageUrl={queryResult?.data?.cast.pfp} 
                rounded={false}
              /> 
          </div>
          }
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              {queryResult?.data && 
              <Link href={`/users/${queryResult?.data?.cast.fname}`}>
                <p className="text-sm font-medium">@{queryResult?.data?.cast.fname}</p>
              </Link>}
              <p className="text-black text-xl">
                {queryResult.isLoading ? 'Loading...' : queryResult?.data ? addHyperlinksToText(queryResult?.data?.cast.text) : 'Error: could not load cast text'}
              </p>
            </div>
            {queryResult?.data?.cast.hash && 
              <p className="text-xs text-black/80 mt-2 w-[100%] flex flex-row gap-1">
                hash: <CopyText text={queryResult?.data?.cast.hash as string} />
              </p>
            }
          </div>
        </div>
      </div>
      <LiveFeed hash={hash} />
    </>
  )
}
export default CastByHash;