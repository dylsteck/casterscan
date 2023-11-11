import React, { useState, useEffect } from 'react';
import Grid from '../Grid';
import List from '../List';
import { api } from '~/utils/api';
import type { KyselyDB } from '~/types/database.t';
import dynamic from 'next/dynamic';
import LiveIndicator from '../LiveIndicator';
import RenderChannelIcon from '../RenderChannelIcon';
import { useLatestCasts } from '~/providers/FarcasterKitProvider';
const LoadingTable = dynamic(() => import('../LoadingTable'), {
    ssr: false
});

interface UserLiveFeedProps {
    user?: string;
}

export default function UserLiveFeed({ user }: UserLiveFeedProps) {
    const [filter, setFilter] = useState<string>('list');
    const [expanded, setExpanded] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const { data: casts, loading } = useLatestCasts({ cursor: page, fname: user });

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            setFilter('grid');
        }
    }, []);

    const handleFilterChange = (input: string) => {
        if (filter !== input) {
            setFilter(input);
        }
    }

    const handleSetPage = (back: boolean) => {
        const newPage = back ? Math.max(page - 50, 0) : page + 50;
        if (newPage !== page) {
          setPage(newPage);
        }
      };

    return (
        <>
            <div className="mt-2 border-b-2 border-[#C1C1C1] min-h-[5vh] max-h-[10vh]">
                <div className="ml-4 flex flex-row gap-2 float-left items-center">
                    <p>LIVE FEED</p>
                    <LiveIndicator />
                </div>
                <div className="ml-4 flex flex-row gap-1 float-left">
                    <p className={`${filter === 'list' ? 'font-bold' : 'font-normal'}`} onClick={() => handleFilterChange('list')}>list</p>
                    <p>|</p>
                    <p className={`${filter === 'grid' ? 'font-bold' : 'font-normal'}`} onClick={() => handleFilterChange('grid')}>grid</p>
                </div>
                {filter == 'list' &&
                    <div className="mr-4 float-right" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <p>collapse [-]</p> : <p>expand [+]</p>}
                    </div>
                }
                <div className="mr-6 float-right flex flex-row gap-3">
                    <p onClick={() => handleSetPage(true)}>{`<=`}</p>
                    <p onClick={() => handleSetPage(false)}>{`=>`}</p>
                </div>
            </div>
            {loading ?
                <LoadingTable />
                : filter === 'list' ? 
                <List expanded={expanded} casts={casts} /> 
                : <Grid casts={casts} />
            }
            {casts && casts.length === 0 && 
                <p className="text-center relative text-black/20 text-7xl pt-[10%]">
                    no casts or replies
                </p>
            }
        </>
    )
}