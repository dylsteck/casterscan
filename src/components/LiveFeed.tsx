import React, { useState } from 'react';
import List from './List';

const LiveFeed: React.FC = () => {
    const [filter, setFilter] = useState<string>('list');

    const handleFilterChange = (input: string) => {
        if(filter !== input){
            setFilter(input);
        }
    }

    return(
    <>
    <div className="mt-2 border-b-2 border-[#C1C1C1] min-h-[5vh] max-h-[10vh]">
        <div className="ml-4 flex flex-row gap-2 float-left items-center">
            <p>LIVE FEED</p>
            <div className="w-3 h-3 rounded-full bg-[#FF0000]" />
        </div>
        <div className="mr-4 flex flex-row gap-1 float-right">
            <p className={`${filter === 'list' && 'font-bold'}`} onClick={() => handleFilterChange('list')}>list</p>
            <p>|</p>
            <p className={`${filter === 'grid' && 'font-bold'}`} onClick={() => handleFilterChange('grid')}>grid</p>
        </div>
    </div>
    <List />
    </>
    )
};

export default LiveFeed;