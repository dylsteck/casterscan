import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { addHyperlinksToText, renderText } from '~/lib/text';
import { getRelativeTime } from '~/lib/time';
import type { KyselyDB } from '~/types/database.t';
import { warpcastChannels } from '~/utils/warpcast-channels';
import RenderChannelIcon from './RenderChannelIcon';
import { ExpandableImage } from './ExpandableImage';

interface GridProps {
  casts: KyselyDB['casts'][];
}

interface GridItemProps {
  cast: KyselyDB['casts'];
}

const GridItem = ({ cast }: GridItemProps) => {
    return (
      <div className={`w[-100vw] md:w-[50vw] lg:w-[33.3vw] first:border-t-0 border-t-2 border-[#9BA4B1]-2 border-l-1  md:border-l-0 h-full border-b-1 break-inside-avoid overflow-x-scroll relative`} style={{ borderLeft: '1px solid #9BA4B1' }}>
  <div className="mb-2 flex flex-row gap-2 items-center p-3 pt-1">
    {cast.pfp && (
      <Image
        width={20}
        height={20}
        className="w-[20px] h-[20px] rounded-full object-cover flex items-center justify-center mt-4"
        src={cast.pfp ?? ''}
      />
    )}
    <Link href={`/users/${cast.fname}`}>
      <p className="text-sm pt-4 font-medium">{cast.fname}</p>
    </Link>
  </div>
  <p className="absolute top-5 right-5 text-sm">
    {getRelativeTime(cast.timestamp.getTime())}
  </p>
  {/* TODO: fix so this link doesn't override links in renderText */}
  <Link href={`/casts/${cast.hash}`}>
    <p className="text-md overflow-x-scroll text-wrap pl-4 pb-2">
      {renderText(cast.text)}
      <div className="mt-2">
        {warpcastChannels.find(channel => channel.parent_url === cast.parentUrl) && <RenderChannelIcon parentUrl={cast.parentUrl ?? ''} />}
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
        casts.map((cast) => (
          <GridItem key={cast.hash} cast={cast} />
        ))}
    </div>
  );
};

export default Grid;