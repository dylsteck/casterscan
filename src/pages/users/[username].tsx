import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '~/utils/api';
import Gallery from '../../components/Gallery';
import TableRow from '../../components/TableRow';
import Image from 'next/image';
import Link from 'next/link';
import type { KyselyDB } from '~/types/database.t';
import type { NFTDData } from '~/types/nftd.t';
import nftdIcon from '../../../public/nftdIcon.png';
import LiveFeed from '~/components/LiveFeed';
import NFTDPopup from '~/components/NFTDPopup';
import { ExpandableImage } from '~/components/ExpandableImage';
import { CalendarIcon, IdentificationIcon } from '@heroicons/react/24/solid';
import { renderText } from '~/lib/text';
import CopyText from '~/components/CopyText';

const UserPage = () => {

  const router = useRouter();
  const t = api.useContext();
  const [user, setUser] = useState<KyselyDB['profiles']>();
  const [nftdInfo, setNftdInfo] = useState<NFTDData[]>();
  const [nftdPopupPresent, setNftdPopupPresent] = useState<boolean>(false);

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
        const nftdDataResponse = await t.user.getUserNFTDData.fetch({ fid: Number(profile.fid) });
        if (nftdDataResponse) {
          setNftdInfo(nftdDataResponse);
        } else {
          console.log(`NFTD data is missing or malformed: ${nftdDataResponse}`);
        }
      } catch (error) {
        console.log(`Error fetching user data: ${error}`);
      }
    }    
    void getUser();

  }, [router, t])

  return(
    <>
      <div className="border-b-2 border-[#C1C1C1] justify-center">
        <div className="p-5 pl-4 pt-5 pb-7 flex flex-row gap-4 items-start align-top">
        {user?.pfp && 
          <div className="w-[60px] h-[60px] flex items-center justify-center">
            <ExpandableImage 
              imageUrl={user?.pfp} 
              rounded={false}
            /> 
          </div>
        }
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 pt-2">
              <p className="text-black text-xl font-medium">{user?.fname}</p>
              {typeof nftdInfo !== 'undefined' && 
                <div className="w-[75px] h-[34.5px]">
                  <Image 
                    src={nftdIcon}
                    width={100} height={46} alt="NF.TD icon" 
                    className="pl-4"
                    onClick={() => setNftdPopupPresent(true)}
                  />
                </div>
              }
            </div>
            <p className="text-black text-md">{renderText(user?.bio ?? '')}</p>
            <div className="flex flex-row gap-1 text-sm">
              <p className="text-[#71579E]">FID:</p> 
              <div className="pt-[2px]">
                <CopyText text={user?.fid} />
              </div>
            </div>
          </div>
          {nftdInfo && nftdPopupPresent && <NFTDPopup nftdData={nftdInfo as NFTDData[]} handleClose={() => setNftdPopupPresent(false)} />}
        </div>
      </div>
      <LiveFeed user={user?.fname} />
    </>
  )
}

export default UserPage;