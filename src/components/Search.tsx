import React, { useContext, useEffect, useState } from 'react';
import Grid from './Grid';
import List from './List';
import { api } from '~/utils/api';
import type { KyselyDB } from '~/types/database.t';
import { getRelativeTime } from '~/lib/time';
import { SearchContext } from '~/context/SearchContext';
import { addHyperlinksToText } from '~/lib/text';
import Link from 'next/link';
import LiveIndicator from './LiveIndicator';

export interface SearchListRowProps{
    type: string;
    username: string;
    text: string;
    link: string;
    timestamp: string;
    expanded: boolean;
}

const SearchListRow = ({type, username, text, link, timestamp, expanded}: SearchListRowProps) => {
    const finalLink = type === 'cast' ? `/casts/${link.replace(/\\/g, "0")}` : `/users/${username}`;
    return(
        <tr className="bg-white">
                <th scope="row" className={`px-6 py-4 whitespace-nowrap text-[#71579E] font-normal ${expanded && 'h-[10vh]'}`}>
                    {type}
                </th>
                <Link href={`/users/${username}`}>
                    <td className="px-6 py-4">
                        {username}
                    </td>
                </Link>
                <td className="px-6 py-4">
                    {addHyperlinksToText(text)}
                </td>
                <td className="px-6 py-4 w-[15%] max-w-[20%]">
                <Link href={finalLink}>
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
    feed: ListRowProps[];
}

const SearchList = ({ expanded, feed }: ListProps) => {

    return(
        
<div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left">
        <thead className="text-md text-[#494949]">
            <tr>
                <th scope="col" className="px-6 py-3 font-normal">
                    type
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    username
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    text
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
           {feed && 
           <>
            {feed.map((feedItem) => {
                return <SearchListRow 
                            type={feedItem.type}
                            username={feedItem.username}
                            text={feedItem.text}
                            link={feedItem.link}
                            timestamp={feedItem.timestamp}
                            expanded={expanded}
                        />
            })}
            </>}
        </tbody>
    </table>
</div>
    )
}

const SearchGrid = (feed: SearchListRowProps[]) => {

    const SearchGridItem = (item: SearchListRowProps) => {
        return(
            <div className="p-3">
                <div className="relative mb-3">
                    <div className="float-left flex flex-row gap-2 items-center">
                        <p>{item.username}</p>
                    </div>
                    <p className="float-right">{getRelativeTime(new Date(item.timestamp))}</p>
                        <div style={{ clear: 'both' }}></div>
                </div>
                <p className="text-sm overflow-x-scroll text-wrap" style={{ clear: 'both' }}>
                {addHyperlinksToText(item.text)}
                </p>
          </div>
        )
    }

    return(
        <div className="grid grid-cols-4 gap-4 p-3">
            {feed.map((feedItem) => {
                return <SearchGridItem item={feedItem as SearchListRowProps} />
            })}
        </div>
    )
}

const Search: React.FC = () => {
    const [filter, setFilter] = useState<string>('list');
    const [expanded, setExpanded] = useState<boolean>(false);

    const { searchValue } = useContext(SearchContext);

    const handleFilterChange = (input: string) => {
        if(filter !== input){
            setFilter(input);
        }
    }

    const listRequest = api.casts.getCastsByKeyword.useQuery(
        { keyword: searchValue }
    );
    // TODO: change so if the keyword is a username or hash, takes you there directly
    // also, clear SearchContext value after the search request goes through

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
        <div className="mr-4 float-right" onClick={() => setExpanded(!expanded)}>
            {expanded ? <p>collapse [-]</p> : <p>expand [+]</p>}
        </div>
    </div>
    {listRequest.isLoading && 
    <>
    <p>loading...</p>
    </> }
    {filter === 'list' ? <SearchList expanded={expanded} feed={listRequest?.data?.list.rows as SearchListRowProps[]} /> : <SearchGrid feed={listRequest?.data?.list.rows as SearchListRowProps[]} />}
    </>
    )
};

export default Search;