// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
import React, { useState, useEffect } from 'react';
import Grid from './Grid';
import List from './List';
import { api } from '~/utils/api';
import type { KyselyDB } from '~/types/database.t';
import dynamic from 'next/dynamic';
import LiveIndicator from './LiveIndicator';
import RenderChannelIcon from './RenderChannelIcon';
import { useFarcasterKit } from 'farcaster-kit';
const LoadingTable = dynamic(() => import('./LoadingTable'), {
    ssr: false
});

interface LiveFeedProps {
    channel?: string;
    hash?: string;
    user?: string;
}

export default function LatestCastsFeed({ channel, hash, user }: LiveFeedProps) {
    const [filter, setFilter] = useState<string>('list');
    const [expanded, setExpanded] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const { useLatestCasts } = useFarcasterKit();
    const { data, loading } = useLatestCasts();

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            setFilter('grid');
        }
    }, []);

    const handleSetPage = (back: boolean) => {
        if (back) {
            if (page > 0) {
                setPage(page - 50)
            }
        }
        else {
            if (data) {
                const castsLength = data.casts.length;
                if (castsLength === 50) {
                    setPage(page + 50);
                }
            }
        }
    }

    const handleFilterChange = (input: string) => {
        if (filter !== input) {
            setFilter(input);
        }
    }
    
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
            {request.isLoading ?
                <LoadingTable />
                : filter === 'list' ? 
                <List expanded={expanded} casts={request?.data?.casts as KyselyDB['casts'][]} /> 
                : <Grid casts={request?.data?.casts as KyselyDB['casts'][]} />
            }
            {request?.data?.casts.length === 0 && 
                <p className="text-center relative text-black/20 text-7xl pt-[10%]">
                    no casts or replies
                </p>
            }
        </>
    )
}