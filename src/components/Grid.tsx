import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { addHyperlinksToText } from '~/lib/text';
import { getRelativeTime } from '~/lib/time';
import type { KyselyDB } from '~/types/database.t';

interface GridProps{
    casts: KyselyDB['casts_with_reactions_materialized'][];
}

interface GridItemProps{
    cast: KyselyDB['casts_with_reactions_materialized'];
}

const GridItem = ({ cast }: GridItemProps) => {
    return(
        <div className="p-3">
            <div className="relative mb-3">
                <div className="float-left flex flex-row gap-2 items-center">
                    {cast.pfp && <Image src={cast.pfp} alt="User PFP" width={4} height={4} className="w-4 h-4 rounded-full" />}
                    <Link href={`/users/${cast.fname}`}>
                        <p className="text-sm text-[#71579E]">{cast.fname}</p>
                    </Link>
                </div>
                <p className="float-right text-sm">{getRelativeTime(new Date(cast.timestamp))}</p>
                    <div style={{ clear: 'both' }}></div>
            </div>
            <p className="text-md overflow-x-scroll text-wrap" style={{ clear: 'both' }}>
            {addHyperlinksToText(cast.text)}
            </p>
      </div>
    )
}

const Grid = ({ casts }: GridProps) => {

    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-3">
        {casts &&
            casts.map((cast) => {
            return <GridItem key={cast.hash} cast={cast} />;
            })}
        </div>
    )
}

export default Grid;