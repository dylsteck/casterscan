import { CACHE_TTLS } from "@/app/lib/utils";
import { farcaster } from "@/app/lib/farcaster";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');
    if(!fid){
        return NextResponse.json({ error: "Missing fid" }, { status: 400 });
    }
    try {
        const responseData = await farcaster.getUser({ fid: fid! });
        return NextResponse.json(responseData, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}