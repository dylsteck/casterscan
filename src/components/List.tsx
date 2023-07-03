import Link from 'next/link';
import React from 'react';
import { getRelativeTime } from '~/lib/time';

interface ListRowProps{
    username: string;
    text: string;
    images?: string[];
    hash: string;
    timestamp: string;
}

const ListRow = ({username, text, images, hash, timestamp}: ListRowProps) => {
    return(
        <tr className="bg-white">
                <th scope="row" className="px-6 py-4 whitespace-nowrap text-[#71579E] font-normal">
                    {username}
                </th>
                <td className="px-6 py-4">
                    {text}
                </td>
                <td className="px-6 py-4">
                {images && images.length > 0 && 
                    <div className="flex items-center justify-center bg-gray-400 w-10 h-10">
                    <p className="text-center">{`+${images.length}`}</p>
                    </div>
                }
                </td>
                <td className="px-6 py-4 w-[15%] max-w-[20%]">
                <Link href={`/casts/${hash}`}>
                    <p className="underline text-[#71579E]">{`link =>`}</p>
                </Link>
                </td>
                <td className="px-6 py-4">
                    {getRelativeTime(new Date(timestamp))}
                </td>
            </tr>
    )
}

const List: React.FC = () => {
    return(
        
<div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left">
        <thead className="text-md">
            <tr>
                <th scope="col" className="px-6 py-3 font-normal">
                    @
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    content
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
           <ListRow 
                username="vgr" 
                text="Hello again Toronto [] Long time no see Aboot time for a visit i guess"
                images={["one image"]}
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="user" 
                text="The collection floor is currently at https://0.68"
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="alexanderchopan" 
                text="i put laser eyes and doteth dao got hostile w me so I put 3,3 and cancelled from nostr once i said i like mammoths my SkeetBTcybercinnected to my lens except i lost..."
                images={["one image", "two image"]}
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="vgr" 
                text="Hello again Toronto [] Long time no see Aboot time for a visit i guess"
                images={["one image"]}
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="user" 
                text="The collection floor is currently at https://0.68"
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="alexanderchopan" 
                text="i put laser eyes and doteth dao got hostile w me so I put 3,3 and cancelled from nostr once i said i like mammoths my SkeetBTcybercinnected to my lens except i lost..."
                images={["one image", "two image"]}
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="vgr" 
                text="Hello again Toronto [] Long time no see Aboot time for a visit i guess"
                images={["one image"]}
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="user" 
                text="The collection floor is currently at https://0.68"
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
            <ListRow 
                username="alexanderchopan" 
                text="i put laser eyes and doteth dao got hostile w me so I put 3,3 and cancelled from nostr once i said i like mammoths my SkeetBTcybercinnected to my lens except i lost..."
                images={["one image", "two image"]}
                hash="0xwerwrtret435435"
                timestamp={new Date().toISOString()}
            />
        </tbody>
    </table>
</div>
    )
}

export default List;