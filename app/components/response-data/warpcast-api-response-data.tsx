import { getWarpcastCast } from "@/app/lib/server";
import ResponseData from ".";

export default async function WarpcastApiResponseData({ hash }: { hash: string }) {
    const warpcastCast = await getWarpcastCast(hash);
    return(
        <>
            <ResponseData data={warpcastCast} title="warpcast api" />
        </>
    )
}