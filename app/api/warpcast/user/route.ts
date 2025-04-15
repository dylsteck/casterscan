import { cachedRequest, WARPCAST_API_URL } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');
    if(!fid){
        return NextResponse.json({ error: "Missing fid" }, { status: 400 });
    }
    try {
        const responseData = await cachedRequest(`${WARPCAST_API_URL}/v2/user?fid=${fid}`, 3600, 'GET', undefined, `warpcast:user:${fid}`);
        return NextResponse.json(responseData);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}