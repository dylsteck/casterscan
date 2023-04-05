import React from 'react';
import Link from 'next/link';
import Gallery from '../../components/Gallery';
import TableRow from '../../components/TableRow';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import localData from '../../lib/localData.json';

const CastByHash = () => {

  const router = useRouter();
  const { hash } = router.query;
  const queryResult = api.casts.getCastByHash.useQuery(
    { hash: hash as string },
    { refetchOnWindowFocus: false}
  );

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
      { (queryResult.isFetching || queryResult.isLoading) && (
        <svg className="mt-7 w-12 h-12 animate-spin text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      )} 

      { (queryResult.isError) && (
        <div className='text-2xl text-red-400 font-bold'>
          Error while fetching cast;
        </div>
      )} 

      {queryResult.isSuccess && (
        <div className="m-3 self-start flex flex-col md:flex-row">
          <div className="border-r border-white mt-[1.25vh] w-full md:w-1/2">
            <div className="pt-[3.5vh] p-5">
               <div className="flex items-center">
               </div>
               <p className="text-2xl text-white">{renderCastText(queryResult.data?.cast?.text as string) || ''}</p>
            </div>
            <TableRow 
              field="Cast Hash"
              image={false}
              result={queryResult.data?.cast?.hash as string} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Casted By" 
                image={true} 
                imageUrl={queryResult.data?.cast?.author_pfp_url as string || ''} 
                imageAlt={`@${queryResult.data?.cast?.author_username as string || ''}'s PFP`} 
                result={`@${queryResult.data?.cast?.author_username as string || ''}`} />
            <TableRow 
                field="Casted At" 
                image={false} 
                result={queryResult.data?.cast ? new Date(queryResult.data.cast.published_at).toLocaleString() : ''} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Likes" 
                image={false} 
                result={String(queryResult.data?.cast?.reactions_count || 0)} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Recasts" 
                image={false} 
                result={String(queryResult.data?.cast?.recasts_count || 0)} imageUrl={''} imageAlt={''} />
            <TableRow 
                field="Replies" 
                image={false} 
                result={String(queryResult.data?.cast?.replies_count || 0)} imageUrl={''} imageAlt={''} />
          </div>
          <div className="w-2/3">
            <Gallery user={queryResult.data?.cast?.author_username as string} />
          </div>
        </div>
      )}
    </main>
);
}
export default CastByHash;
