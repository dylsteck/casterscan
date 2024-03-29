/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { getRelativeTime } from '~/lib/time';
import { warpcastChannels } from '~/utils/warpcastChannels';
import RenderChannelIcon from './RenderChannelIcon';
import { renderText } from '~/lib/text';
import { type Cast } from 'farcasterkit';

interface GridProps {
  casts: Cast[];
}

interface GridItemProps {
  cast: Cast;
}

const GridItem = ({ cast }: GridItemProps) => {
    return (
      <div className={`w[-100vw] md:w-[50vw] lg:w-[33.3vw] first:border-t-0 border-t-2 border-[#9BA4B1]-2 border-l-1  md:border-l-0 h-full border-b-1 break-inside-avoid overflow-x-scroll relative`} style={{ borderLeft: '1px solid #9BA4B1' }}>
  <div className="mb-2 flex flex-row gap-2 items-center p-3 pt-1">
    {cast && cast.pfp && (
      <img
        width={20}
        height={20}
        className="w-[20px] h-[20px] rounded-full object-cover flex items-center justify-center mt-4"
        src={cast.pfp ?? ''}
        alt="Image for cast"
      />
    )}
    <Link href={`/users/${cast.fname ?? ''}`}>
      <p className="text-sm pt-4 font-medium">{cast.fname}</p>
    </Link>
  </div>
  <p className="absolute top-5 right-5 text-sm">
    {getRelativeTime(new Date(cast.timestamp).getTime())}
  </p>
  {/* TODO: fix so this link doesn't override links in renderText */}
  <Link href={`/casts/${String(cast.hash)}`}>
    <p className="text-md overflow-x-scroll text-wrap pl-4 pb-2">
      {renderText(cast.text)}
      <div className="mt-2">
        {warpcastChannels.find(channel => channel.parent_url === cast.parent_url) && <RenderChannelIcon parentUrl={cast.parent_url ?? ''} />}
      </div>  
    </p>
  </Link>
</div>
    );
};

const Grid = ({ casts }: GridProps) => {
  return (
    <div className="lg:columns-3 md:columns-2 auto-cols-auto overflow-x-hidden overflow-y-visible">
      {casts &&
        casts.map((cast, index) => (
          <GridItem key={`cast-${index}`} cast={cast} />
        ))}
    </div>
  );
};

export default Grid;