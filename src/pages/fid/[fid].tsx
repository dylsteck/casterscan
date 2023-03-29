import React from 'react'
import { useRouter } from 'next/router'
import { api } from '~/utils/api';
import Gallery from '../../components/Gallery';
import TableRow from '../../components/TableRow';
import Image from 'next/image';
import Link from 'next/link';
import localData from '../../lib/localData.json';


const UserByFid = () => {

  const router = useRouter();
  const { fid } = router.query;
  const isProd = false
  const queryResult = isProd ? api.user.getUserPageData.useQuery({
    fid: fid as string
  }, {
    refetchOnWindowFocus: false
  }): {data: {fid: localData.fid }};

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
                  <Image alt="User PFP" src={queryResult.data?.fid?.pfp.url as string} width={50} height={50} />
                </div>
                <div>
                  <p className="text-2xl text-white mt-2 ml-3">{queryResult.data?.fid?.displayName || ''}</p>
                  <p className="text-lg text-white mt-2 ml-3">{queryResult.data?.fid?.profile.bio.text || ''}</p>                </div>
              </div>
            </div>
            <TableRow 
              field="Followers"
              image={false}
              result={queryResult.data?.fid?.followerCount as string} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Following" 
                image={false} 
                result={queryResult.data?.fid?.followingCount as string} />
            <TableRow 
                field="Username" 
                image={false} 
                result={queryResult.data?.fid?.username as string} />
            <TableRow 
                field="FID" 
                image={false} 
                result={queryResult.data?.fid?.fid as string} />
            {queryResult.data?.fid?.profile.location.description.length > 0 && 
            <>
              <TableRow 
                field="Location" 
                image={false} 
                result={queryResult.data?.fid?.profile.location.description as string} />
            </>
            }
            {queryResult.data?.fid?.referrerUsername.length > 0 && 
            <>
              <TableRow 
                field="Referrer" 
                image={false} 
                result={queryResult.data?.fid?.referrerUsername as string} />
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
