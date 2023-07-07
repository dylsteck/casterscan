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
import { NFTDPopup } from '~/components/NFTDPopup';

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
        <div className="p-5 pl-4 pt-5 pb-7 flex flex-row gap-4 items-center">
          {user?.pfp && 
          <Image 
            src={user?.pfp} 
            className="rounded-full w-[60px] h-[60px]"
            width={60} height={60} 
            alt={`${user?.fname}'s PFP`} /> 
          }
          <p className="text-black text-5xl">{user?.fname}</p>
          <Image 
            src={nftdIcon}
            width={100/1.3} height={43/1.3} alt="NF.TD icon" 
            className="pl-4 pt-2 pb-5"
            onClick={() => setNftdPopupPresent(true)}
          />
          {nftdInfo && nftdPopupPresent && <NFTDPopup nftdData={nftdInfo} handleClose={() => setNftdPopupPresent(false)} />}
        </div>
      </div>
    </>
  )
}

export default UserPage;
