import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '~/utils/api';
import LiveFeed from '~/components/LiveFeed';
import { ExpandableImage } from '~/components/ExpandableImage';
import { renderText } from '~/lib/text';
import CopyText from '~/components/CopyText';

interface LocalUser{
  fid: bigint; created_at: string; custody_address: string; pfp: string | null; display: string | null; bio: string | null; url: string | null; fname: string | null;
} // TODO: fix KyselyDB types, this interface is a temporary fix to some build errors

const UserPage = () => {

  const router = useRouter();
  const t = api.useContext();
  const [user, setUser] = useState<LocalUser>();

  useEffect(() => {

    if (!router.isReady) {
      console.log("router not yet ready.");
      return;
    }
    const { username } = router.query
    if (!username) {
      console.log("unable to get username");
      return;
    }

    async function getUser() {
      try {
        const { user: profile } = await t.user.getUserPageData.fetch({ username: username as string });
        setUser(profile);
      } catch (error) {
        if (typeof error === 'string') {
          console.log(`Error fetching user data: ${error}`);
        } else {
          console.log('Error fetching user data');
        }
      }
    }    
    void getUser();

  }, [router, t])

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
      <LiveFeed user={user?.fname ?? ''} />
    </>
  )
}

export default UserPage;