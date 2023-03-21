import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '~/utils/api';

import {
  ArrowPathRoundedSquareIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const UserByFid = () => {

  const router = useRouter();
  const { fid } = router.query;

  const queryResult = api.user.getUserPageData.useQuery(
  { fid: fid },
  { enabled: !!fid }
);


  return (
    <main className="
      flex flex-col
      items-center justify-center
      min-h-fit
    ">
      { queryResult.isFetching ? "Loading" : (
        !queryResult.isSuccess ? "Invalid FID" : (

          <div className="
            flex flex-row gap-5
            mt-5
          ">
            <article className='w-1/2'>
              <div className='flex flex-row m-2 '>
                <img src={queryResult.data.user?.avatar_url || "/assets/img/casterScanIcon.png"}
                  alt="User pfp." 
                  className="
                    w-24 h-24
                "/>

                <div className='flex flex-row ml-7 mt-7'>
                  <div className='flex flex-col'>
                    <p className="font-black text-purple-900 text-3xl"> {queryResult.data.user?.following} </p>
                    <p className='font-bold text-purple-800'> Following </p>
                  </div>

                  <div className='flex flex-col ml-7'>
                    <p className="font-black text-purple-900 text-3xl"> {queryResult.data.user?.followers} </p>
                    <p className='font-bold text-purple-800'> Followers </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
      ))}
    </main>
  )
}

export default UserByFid;
