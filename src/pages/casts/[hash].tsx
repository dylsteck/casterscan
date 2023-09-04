import React from 'react';
import Link from 'next/link';
import { api } from '~/utils/api';
import LiveFeed from '~/components/LiveFeed';
import CopyText from '~/components/CopyText';
import { addHyperlinksToText } from '~/lib/text';
import { ExpandableImage } from '~/components/ExpandableImage';
import { useRouter } from 'next/router';
import { getRelativeTime } from '~/lib/time';

interface CastByHashProps {
  hash: string;
}

const CastByHash: React.FC<CastByHashProps> = ({ hash }) => {

  const router = useRouter();
  const routerHash = router.query.hash ?? hash;
  
  const queryResult = api.casts.getCastByHash.useQuery(
    { hash: routerHash as string },
    { refetchOnWindowFocus: false }
  );

  return (
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
                <Link href={`/users/${queryResult?.data?.cast.fname ?? ''}`}>
                  <p className="text-sm font-medium">@{queryResult?.data?.cast.fname}</p>
                </Link>}
              <p className="text-black text-xl">
                {queryResult.isLoading ? 'Loading...' : queryResult?.data ? addHyperlinksToText(queryResult?.data?.cast.text) : 'Error: could not load cast text'}
              </p>
            </div>
            {queryResult?.data?.cast.hash && 
              <p className="text-xs text-black/80 mt-2 w-[100%] flex flex-row gap-1">
                hash: <CopyText text={String(queryResult?.data?.cast.hash) ?? ''} />
              </p>
            }
            {queryResult?.data?.cast.timestamp && 
              <p className="text-xs text-black/80 w-[100%] flex flex-row gap-1">
                casted <CopyText text={getRelativeTime(queryResult?.data?.cast.timestamp.getTime())} />
              </p>
            }
          </div>
        </div>
      </div>
      {routerHash && <LiveFeed hash={routerHash as string} /> }
    </>
  );
};

export default CastByHash;