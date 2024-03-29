/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { warpcastChannels } from "~/utils/warpcastChannels"


export default function RenderChannelIcon({ parentUrl }: { parentUrl: string}){
    const channel = warpcastChannels.find(c => c.parent_url === parentUrl);
    // TODO: show og:image for other non-channel FIP-2 replies
    return(
        <div className="max-w-xs">
            <Link href={`/channels?url=${channel?.parent_url ?? ''}`}>
                <div className="inline-flex flex-row items-center gap-2">
                    <img src={channel ? channel.image : ''} alt={`Channel ${channel ? channel.name : ''}`} width={30} height={30} className="rounded-md w-5 h-5" />
                    <p className="text-xs">{channel ? channel.name : ''}</p>
                </div>
            </Link>
      </div>      
    )
}