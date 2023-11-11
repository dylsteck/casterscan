import React from 'react';
import Link from 'next/link';
import CopyText from '~/components/CopyText';
import { addHyperlinksToText } from '~/lib/text';
import { ExpandableImage } from '~/components/ExpandableImage';
import { useRouter } from 'next/router';
import { getRelativeTime } from '~/lib/time';
import { useCast } from '~/providers/FarcasterKitProvider';
import { KyselyDB } from '~/types/database.t';
import CastRepliesLiveFeed from '~/components/LiveFeed/CastRepliesLiveFeed';

interface CastByHashProps {
  hash: string;
}

const CastByHash: React.FC<CastByHashProps> = ({ hash }) => {

  const router = useRouter();
  const routerHash = router.query.hash ?? hash;
  const { data: cast, loading } = useCast({ hash: (router.query.hash ?? hash) as string}) as { data: KyselyDB['casts'], loading: boolean}
  
  // const queryResult = api.casts.getCastByHash.useQuery(
  //   { hash: routerHash as string },
  //   { refetchOnWindowFocus: false }
  // );

  return (
    <>
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <div className="p-5 pl-4 pt-5 pb-7 flex flex-row gap-4 items-center align-top">
          {cast && cast.pfp && 
            <div className="w-[60px] h-[60px] flex items-center justify-center">
              <ExpandableImage 
                imageUrl={cast.pfp} 
                rounded={false}
              /> 
            </div>
          }
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              {cast && 
                <Link href={`/users/${cast.fname ?? ''}`}>
                  <p className="text-sm font-medium">@{cast.fname ?? ''}</p>
                </Link>}
              <p className="text-black text-xl">
                {loading ? 'Loading...' : cast ? addHyperlinksToText(cast.text) : 'Error: could not load cast text'}
              </p>
            </div>
            {cast && cast.hash && 
              <p className="text-xs text-black/80 mt-2 w-[100%] flex flex-row gap-1">
                hash: <CopyText text={String(cast.hash) ?? ''} />
              </p>
            }
            {cast && cast.timestamp && 
              <p className="text-xs text-black/80 w-[100%] flex flex-row gap-1">
                casted <CopyText text={getRelativeTime(new Date(cast.timestamp).getTime())} />
              </p>
            }
          </div>
        </div>
      </div>
      {routerHash && <CastRepliesLiveFeed hash={routerHash as string} /> }
    </>
  );
};

export default CastByHash;