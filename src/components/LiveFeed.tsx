import React, { useState } from 'react';
import Grid from './Grid';
import List from './List';
import { api } from '~/utils/api';
import type { KyselyDB } from '~/types/database.t';

const LiveFeed: React.FC = () => {
    const [filter, setFilter] = useState<string>('list');
    const [expanded, setExpanded] = useState<boolean>(false);

    const handleFilterChange = (input: string) => {
        if(filter !== input){
            setFilter(input);
        }
    }

    const castsRequest = api.casts.getLatestCasts.useQuery(
        { startRow: 0 },
        { refetchOnWindowFocus: false }
    );

    return(
    <>
    <div className="mt-2 border-b-2 border-[#C1C1C1] min-h-[5vh] max-h-[10vh]">
        <div className="ml-4 flex flex-row gap-2 float-left items-center">
            <p>LIVE FEED</p>
            <div className="w-2 h-2 rounded-full bg-[#FF0000]" />
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
    {castsRequest.isLoading && 
    <>
    <p>loading...</p>
    </>}
    {filter === 'list' ? <List expanded={expanded} casts={castsRequest?.data?.casts as KyselyDB['casts_with_reactions_materialized'][]} /> : <Grid casts={castsRequest?.data?.casts as KyselyDB['casts_with_reactions_materialized'][]} />}
    </>
    )
};

export default LiveFeed;