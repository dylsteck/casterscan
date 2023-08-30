import Image from "next/image";
import Link from "next/link";
import { warpcastChannels } from "~/utils/warpcast-channels"


export default function RenderChannelIcon({ parentUrl }: { parentUrl: string}){
    const channel = warpcastChannels.find(c => c.parent_url === parentUrl);
    // TODO: show og:image for other non-channel FIP-2 replies
    return(
        <div className="max-w-xs">
            <Link href={`/channels?url=${channel?.parent_url ?? ''}`}>
                <div className="inline-flex flex-row items-center gap-2">
                    <Image src={channel ? channel.image : ''} alt={`Channel ${channel ? channel.name : ''}`} width={5} height={5} className="rounded-md w-5 h-5" />
                    <p className="text-xs">{channel ? channel.name : ''}</p>
                </div>
            </Link>
      </div>      
    )
}