import React from 'react'
import { useRouter } from 'next/router'
import { api } from '~/utils/api';
import Gallery from '../../components/Gallery';
import TableRow from '../../components/TableRow';
import Image from 'next/image';
import Link from 'next/link';
import localData from '../../lib/localData.json';
import type { Profile }  from '../../types/indexer';


const UserByFid = () => {

  const router = useRouter();
  const { fid } = router.query;
  const isProd = false
  const queryResult = isProd ? api.user.getUserPageData.useQuery({
    fid: fid as string
  }, {
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.log(err)
    }
  }): {data: {user: localData.fid as unknown as Profile}} ;

  console.log(queryResult)
  return (
    <main className="
      flex flex-col
      items-center justify-center
      min-h-fit
    ">
      { isProd && !queryResult.data ?
      <div className="mt-16 p-7 text-xl">
        <p className='text-red-400 font-bold'>Invalid FID</p>
        <Link href="/" className='text-purple-800 font-semibold '>{"←"} Go home</Link>
      </div>
         :
      <div className="flex flex-col md:flex-row">
          <div className="border-r border-white mt-[1.25vh] w-full md:w-1/2">
            <div className="pt-[3.5vh] p-5">
               <div className="flex items-center">
               </div>
              <div className="flex">
                <div>
                  {queryResult.data?.user?.pfp?.url && <Image alt="User PFP" src={queryResult.data?.user?.pfp.url} width={50} height={50} />}
                </div>
                <div>
                  <p className="text-2xl text-white mt-2 ml-3">{queryResult.data?.user?.displayName || ''}</p>
                  <p className="text-lg text-white mt-2 ml-3">{queryResult.data?.user?.profile?.bio?.text || ''}</p>                </div>
              </div>
            </div>
            <TableRow 
              field="Followers"
              image={false}
              result={queryResult.data?.user?.followerCount?.toString() as string} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Following" 
                image={false} 
                result={queryResult.data?.user?.followingCount?.toString() as string} />
            <TableRow 
                field="Username" 
                image={false} 
                result={queryResult.data?.user?.username as string} />
            <TableRow 
                field="FID" 
                image={false} 
                result={queryResult.data?.user?.fid?.toString() as string} />
            {typeof queryResult.data?.user?.profile?.location?.description !== 'undefined' && 
            <>
              <TableRow 
                field="Location" 
                image={false} 
                result={queryResult.data?.user?.profile?.location?.description} />
            </>
            }
            {typeof queryResult.data?.user?.referrerUsername !== 'undefined' && 
            <>
              <TableRow 
                field="Referrer" 
                image={false} 
                result={queryResult.data?.user?.referrerUsername} />
            </>
            }
          </div>
          <div className="w-2/3">
            <Gallery user={''} />
          </div>
        </div>
      }
    </main>
  )
}

export default UserByFid;
