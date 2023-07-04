import Link from 'next/link';
import React from 'react';
import { getRelativeTime } from '~/lib/time';
import { api } from '~/utils/api';
import type { KyselyDB } from '~/types/database.t';
import { addHyperlinksToText } from '~/lib/text';

interface ListRowProps{
    username: string;
    text: string;
    hash: string;
    timestamp: string;
    expanded: boolean;
}

const ListRow = ({username, text, hash, timestamp, expanded}: ListRowProps) => {

      const checkImages = (): string[] => {
        const pattern = /(https?:\/\/[^\s]+)/g;
        const imgurLinks: string[] = [];
      
        let match;
        while ((match = pattern.exec(text)) !== null) {
          if (match[0].includes('imgur.com')) {
            imgurLinks.push(match[0]);
          }
        }
      
        return imgurLinks;
      };
    const images = checkImages();
    return(
        <tr className="bg-white">
                <th scope="row" className={`px-6 py-4 whitespace-nowrap text-[#71579E] font-normal ${expanded && 'h-[10vh]'}`}>
                    {username}
                </th>
                <td className="px-6 py-4">
                    {addHyperlinksToText(text)}
                </td>
                <td className="px-6 py-4">
                {images && images.length > 0 && 
                    <div className="flex items-center justify-center bg-gray-400 w-10 h-10">
                    <p className="text-center">{`+${images.length}`}</p>
                    </div>
                }
                </td>
                <td className="px-6 py-4 w-[15%] max-w-[20%]">
                <Link href={`https://warpcast.com/${username}/${hash.substring(0, 8)}`}>
                    <p className="underline text-[#71579E]">{`link =>`}</p>
                </Link>
                </td>
                <td className="px-6 py-4 w-[10%] max-w-[15%]">
                    {getRelativeTime(new Date(timestamp))}
                </td>
            </tr>
    )
}

interface ListProps{
    expanded: boolean;
    casts: KyselyDB['casts_with_reactions_materialized'][];
}

const List = ({ expanded, casts }: ListProps) => {

    return(
        
<div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left">
        <thead className="text-md text-[#494949]">
            <tr>
                <th scope="col" className="px-6 py-3 font-normal">
                    @
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    content
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    img
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    link
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    time
                </th>
            </tr>
        </thead>
        <tbody>
           {casts && 
           <>
            {casts.map((cast) => {
                return <ListRow 
                            username={cast.fname || ''}
                            text={cast.text}
                            hash={cast.hash}
                            timestamp={cast.timestamp}
                            expanded={expanded}
                        />
            })}
            </>}
        </tbody>
    </table>
</div>
    )
}

export default List;