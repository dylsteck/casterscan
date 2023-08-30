import Link from 'next/link';
import React, { useState } from 'react';
import { getRelativeTime } from '~/lib/time';
import { api } from '~/utils/api';
import type { KyselyDB } from '~/types/database.t';
import { addHyperlinksToText } from '~/lib/text';
import Image from 'next/image';
import { ExpandableImage } from './ExpandableImage';
import CopyText from './CopyText';
import { motion } from 'framer-motion';
import { warpcastChannels } from '~/utils/warpcast-channels';
import RenderChannelIcon from './RenderChannelIcon';

interface ListRowProps{
    username: string;
    text: string;
    hash: string;
    parentUrl: string;
    timestamp: string;
    expanded: boolean;
}

const ListRow = ({username, text, hash, parentUrl, timestamp, expanded}: ListRowProps) => {

    const checkImages = (): string[] => {
        const pattern = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/g;
        const imageLinks: string[] = [];
      
        let match;
        while ((match = pattern.exec(text)) !== null) {
          imageLinks.push(match[0]);
        }
      
        return imageLinks;
    };

    const containerAnimation = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

    // note: some images not showing up
    // eg. search 'casterscan', casts have images, none show up in expanded
    // TODO: fix
    const images = checkImages();
    return(
        <tr className="bg-white">
                <motion.th
                    scope="row"
                    className={`px-6 py-4 whitespace-nowrap text-[#71579E] font-normal ${
                        expanded ? "h-[10vh]" : ''
                    }`}
                    variants={containerAnimation}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    >
                    <Link href={`/users/${username}`}>
                        {username}
                    </Link>
                </motion.th>
                <td className="px-6 py-4">
                    {addHyperlinksToText(text)}
                    <div className="pt-2">
                        {warpcastChannels.find(channel => channel.parent_url === parentUrl) && <RenderChannelIcon parentUrl={parentUrl} />}
                    </div>
                    {expanded && 
                    <div className="flex flex-row gap-2 items-end">
                        {images.map((image, index) => {
                            return <ExpandableImage imageUrl={image} rounded={false} />
                        })}
                        <p className={`text-xs text-black/80 ${images.length === 0 && 'mt-2'} flex flex-row gap-1`}>
                            hash: <CopyText text={hash} />
                        </p>
                    </div>}

                </td>
                <td className="px-6 py-4">
                {images && images.length > 0 && 
                    <div className="flex items-center justify-center bg-gray-400 w-10 h-10">
                    <p className="text-center">{`+${images.length}`}</p>
                    </div>
                }
                </td>
                <td className="px-6 py-4 w-[15%] max-w-[20%]">
                <Link href={`/casts/${hash}`}>
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
    casts: KyselyDB['casts'][];
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
                            parentUrl={cast.parentUrl}
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