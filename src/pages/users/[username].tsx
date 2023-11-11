import React from 'react'
import { useRouter } from 'next/router'
import LiveFeed from '~/components/LiveFeed/LiveFeed';
import { ExpandableImage } from '~/components/ExpandableImage';
import { renderText } from '~/lib/text';
import CopyText from '~/components/CopyText';
import UserLiveFeed from '~/components/LiveFeed/UserLiveFeed';
import { User, useUser } from '~/providers/FarcasterKitProvider';

const UserPage = () => {

  const router = useRouter();
  const { data: user, loading } = useUser({ fname: router.query.username as string}) as { data: User, loading: boolean };

  return(
    <>
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <div className="p-5 pl-4 pt-5 pb-7 flex flex-row gap-4 items-start align-top">
        {user?.pfp && 
          <div className="w-[60px] h-80px] max-h-[80px] overflow-y-hidden flex items-center justify-center">
            <ExpandableImage 
              imageUrl={user?.pfp} 
              rounded={false}
            /> 
          </div>
        }
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 pt-2">
              <p className="text-black text-xl font-medium">{user?.fname}</p>
            </div>
            <p className="text-black text-md">{renderText(user?.bio ?? '')}</p>
            <div className="flex flex-row gap-1 text-sm">
              <p className="text-[#71579E]">FID:</p> 
              <div className="pt-[2px]">
                <CopyText text={String(user?.fid)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserLiveFeed user={user?.fname ?? ''} />
    </>
  )
}

export default UserPage;