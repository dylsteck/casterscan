import React, { useEffect, useState } from 'react';
import Grid from './Grid';
import List from './List';
import { api } from '~/utils/api';
import type { KyselyDB } from '~/types/database.t';
import { useInfiniteQuery } from '@tanstack/react-query';
import { castsRouter } from '~/server/api/routers/cast';
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion';
import LiveIndicator from './LiveIndicator';
const LoadingTable = dynamic(() => import('./LoadingTable'), {
    ssr: false
});

const LiveFeed: React.FC = ({ user }: { user?: string }) => {
    const [filter, setFilter] = useState<string>('list');
    const [expanded, setExpanded] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);

    const handleFilterChange = (input: string) => {
        if(filter !== input){
            setFilter(input);
        }
    }

    //If user, get their casts -- otherwise get all casts
    const request = user ? api.casts.getCastsByUsername.useQuery(
        { startRow: 0, username: user },
        { refetchOnWindowFocus: false }
    ) 
    : api.casts.getLatestCasts.useInfiniteQuery(
        { limit: 30 }, 
        { getNextPageParam: (lastPage) => { return lastPage.nextCursor ?? null },
          initialCursor: 0,
          keepPreviousData: true}
    );
    useEffect(() => {
    }, [request?.data?.pages])
    return(
    <>
    <div className="mt-2 border-b-2 border-[#C1C1C1] min-h-[5vh] max-h-[10vh]">
        <div className="ml-4 flex flex-row gap-2 float-left items-center">
            <p>LIVE FEED</p>
            <LiveIndicator />
        </div>
        <div className="ml-4 flex flex-row gap-1 float-left">
            <p className={`${filter === 'list' && 'font-bold'}`} onClick={() => handleFilterChange('list')}>list</p>
            <p>|</p>
            <p className={`${filter === 'grid' && 'font-bold'}`} onClick={() => handleFilterChange('grid')}>grid</p>
        </div>
        {filter == 'list' && 
        <div className="mr-4 float-right" onClick={() => setExpanded(!expanded)}>
            {expanded ? <p>collapse [-]</p> : <p>expand [+]</p>}
        </div>
        }
    </div>
    {request.isLoading ? 
    <LoadingTable />
    : filter === 'list' ? <List expanded={expanded} casts={request?.data?.pages[0].casts as KyselyDB['casts_with_reactions_materialized'][]} /> : <Grid casts={request?.data?.pages[0].casts as KyselyDB['casts_with_reactions_materialized'][]} />}
    </>
    )
};

export default LiveFeed;