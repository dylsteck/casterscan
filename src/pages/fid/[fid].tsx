import React from 'react'
import { useRouter } from 'next/router'
import { api } from '~/utils/api';
import Image from 'next/image';
import Link from 'next/link';


const UserByFid = () => {

  const router = useRouter();
  const { fid } = router.query;

  const queryResult = api.user.getUserPageData.useQuery({
    fid: fid as string
  }, {
    refetchOnWindowFocus: false
  });


  return (
    <main className="
      flex flex-col
      items-center justify-center
      min-h-fit
    ">
      { queryResult.isFetching ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="
              justify-self-end
              mt-16 w-12 h-12
              animate-spin
              stroke-2 stroke-purple-700
          ">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ) : (
        !queryResult.isSuccess ? (

          <div className="
            mt-16 p-7
            text-xl
          ">
            <p className='text-red-400 font-bold'>Invalid FID</p>
            <Link href="/" className='text-purple-800 font-semibold '>{"←"} Go home</Link>
          </div>
        ) : (

          <div className="
            flex flex-row gap-5
            mt-5
          ">
            <article className='w-1/2'>
              <div className='flex flex-row m-2 '>
                <Image src={queryResult.data.user?.avatar_url as string}
                  alt="User pfp." 
                  width={96}
                  height={96}
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
