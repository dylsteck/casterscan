import Link from 'next/link';
import React from 'react';
import { getRelativeTime } from '~/lib/time';
import { addHyperlinksToText } from '~/lib/text';
import { ExpandableImage } from './ExpandableImage';
import CopyText from './CopyText';
import { motion } from 'framer-motion';
import { warpcastChannels } from '~/utils/warpcastChannels';
import RenderChannelIcon from './RenderChannelIcon';
import { type Cast } from 'farcasterkit';

export interface ListRowProps {
  username: string;
  text: string;
  hash: string;
  parentUrl: string;
  timestamp: Date;
  expanded: boolean;
  embeds?: LocalEmbed[] | undefined;
}

export interface LocalEmbed {
  url?: string | undefined;
  castId?: object | undefined;
}

const ListRow = ({
  username,
  text,
  hash,
  parentUrl,
  timestamp,
  expanded,
  embeds,
}: ListRowProps) => {
  const checkImages = (): string[] => {
    const pattern = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/g;
    const imageLinks: string[] = [];

    let match;
    while ((match = pattern.exec(text)) !== null) {
      imageLinks.push(match[0]);
    }
    if(embeds){
      embeds.map((embed: LocalEmbed) => {
        while ((match = pattern.exec(embed.url ?? '')) !== null) {
          imageLinks.push(match[0]);
        }
      });
    }
    return imageLinks;
  };

  const containerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const images = checkImages();
  return (
    <tr className="bg-white">
      <motion.th
        scope="row"
        className={`px-6 py-4 whitespace-nowrap text-[#71579E] font-normal ${
          expanded ? 'h-[10vh]' : ''
        }`}
        variants={containerAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Link href={`/users/${username}`}>{username}</Link>
      </motion.th>
      <td className={`px-6 py-4 ${expanded ? 'whitespace-normal' : 'whitespace-nowrap'}`}>
        <div className={`max-w-full ${expanded ? 'break-words' : ''}`}>
            {addHyperlinksToText(text)}
        </div>
        <div className="pt-2">
            {warpcastChannels.find((channel) => channel.parent_url === parentUrl) && (
            <RenderChannelIcon parentUrl={parentUrl} />
            )}
        </div>
        {expanded && (
            <div className="flex flex-col gap-2 items-start">
            {images.map((image, index) => (
                <ExpandableImage imageUrl={image} rounded={false} key={index} />
            ))}
            <p className={`text-xs text-black/80 ${images.length === 0 ? 'mt-2' : 'mt-0'} flex flex-row gap-1`}>
                hash: <CopyText text={hash} />
            </p>
            </div>
        )}
      </td>
      <td className="px-6 py-4">
        {images && images.length > 0 && (
          <div className="flex items-center justify-center bg-gray-400 w-10 h-10">
            <p className="text-center">{`+${images.length}`}</p>
          </div>
        )}
      </td>
      <td className="px-6 py-4 w-[15%] max-w-[20%]">
        <Link href={`/casts/${hash}`}>
          <p className="underline text-[#71579E]">{`link =>`}</p>
        </Link>
      </td>
      <td className="px-6 py-4 w-[10%] max-w-[15%]">
        {/* {getRelativeTime(timestamp.getTime())} */}
        {getRelativeTime(new Date(timestamp).getTime())}
      </td>
    </tr>
  );
};

interface ListProps {
  expanded: boolean;
  casts: Cast[];
}

const List = ({ expanded, casts }: ListProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full sm:text-sm text-left">
        <thead className="text-md text-[#494949]">
          <tr className="hidden sm:table-row">
            <th scope="col" className="px-6 py-3 font-normal">
              @
            </th>
            <th scope="col" className="px-6 py-3 font-normal">
              <div className="max-w-full sm:max-w-xs"></div>
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
            casts.map((cast, index) => (
              <ListRow
                username={cast.fname || ''}
                text={cast.text}
                hash={`${String(cast.hash)}`}
                parentUrl={cast.parent_url ?? ''}
                timestamp={cast.timestamp}
                expanded={expanded}
                embeds={cast.embeds as unknown as LocalEmbed[]}
                key={index}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;