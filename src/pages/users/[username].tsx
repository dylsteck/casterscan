import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '~/utils/api';
import Gallery from '../../components/Gallery';
import TableRow from '../../components/TableRow';
import Image from 'next/image';
import Link from 'next/link';
import { Database } from '~/types/database.t';

const UserByUsername = () => {

  const router = useRouter();
  const t = api.useContext();
  const [user, setUser] = useState<Database['public']['Tables']['profile']['Row']>();

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
      console.log("getting user");
      const { user: profile } = await t.user.getUserPageData.fetch({username: username as string});
      setUser(profile);
    }

    getUser();

  }, [])

  const renderCastText = (text: string) => {
    const imgurRegex = /(https?:\/\/)?(www\.)?(i\.)?imgur\.com\/[a-zA-Z0-9]+(\.(jpg|jpeg|png|gif|bmp))?/g;
    const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
  
    const imgurMatches = text.match(imgurRegex);
    if (imgurMatches) {
      const textWithoutImgur = text.replace(imgurRegex, '').trim();
      return (
        <>
          <p>{textWithoutImgur}</p>
          {imgurMatches.map((match) => (
            <div key={match.length + 1} className="mt-4 mb-4 flex justify-center">
              <img src={`${match}.png`} alt="imgur image" width={400} height={400} className="max-w-[20ch] max-h-[20ch] object-contain" />
            </div>
          ))}
        </>
      );
    }
  
    const tokens = text.split(urlRegex);
    return (
      <p>
        {tokens.map((token, index) => {
          if (urlRegex.test(token)) {
            const url = token.startsWith('http') ? token : `http://${token}`;
            return (
              <Link key={index} href={url}>
                {token}
              </Link>
            );
          }
          return token;
        })}
      </p>
    );
  };

  return (
    <main className="
      flex flex-col
      items-center justify-center
      min-h-fit
    ">
      { !user &&
        <svg className="mt-7 w-12 h-12 animate-spin text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      }

      { user && <div className="flex flex-col md:flex-row">
            <div className="border-r border-white mt-[1.25vh] w-full md:w-1/2">
              <div className="pt-[3.5vh] p-5">
                 <div className="flex items-center">
                 </div>
                <div className="flex">
                  <div>
                    <Image alt="User PFP" src={user.avatar_url || "https://explorer.farcaster.xyz/avatar.png"} width={50} height={50} />
                  </div>
                  <div>
                    <p className="text-2xl text-white mt-2 ml-3">{user.display_name || ''}</p>
                    <p className="text-lg text-white mt-2 ml-3">{renderCastText(user.bio as string) || ''}</p>
                  </div>
                </div>
              </div>
              <TableRow 
                field="Followers"
                image={false}
                result={user.following?.toString() || ""} imageUrl={''} imageAlt={''} />
              <TableRow 
                field="Following" 
                image={false} 
                result={user.followers?.toString() || ""} imageUrl={''} imageAlt={''} />
              <TableRow 
                  field="Username" 
                  image={false} 
                  result={user.username || ""} />
              <TableRow 
                  field="FID" 
                  image={false} 
                  result={user.id.toString()} />
              {user.referrer && 
              <>
                <TableRow 
                  field="Referrer" 
                  image={false} 
                  result={user.referrer} />
              </>
              }
            </div>
            <div className="w-2/3">
              <Gallery user={user.username || ""} />
            </div>
          </div>
      }
    </main>
  )
}

export default UserByUsername;
