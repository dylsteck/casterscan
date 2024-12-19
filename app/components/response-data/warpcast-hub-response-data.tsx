import { getHubCast } from "@/app/lib/server";
import ResponseData from ".";

export default async function WarpcastHubResponseData({ fid, hash }: { fid: number, hash: string }) {
    const neynarHubCast = await getHubCast(fid, hash, 'warpcast');
    return(
        <>
            <ResponseData data={neynarHubCast} title="warpcast hub" />
        </>
    )
}