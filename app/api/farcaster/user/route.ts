import { FARCASTER_API_URL, CACHE_TTLS } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');
    if(!fid){
        return NextResponse.json({ error: "Missing fid" }, { status: 400 });
    }
    try {
        const response = await fetch(`${FARCASTER_API_URL}/v2/user?fid=${fid}`, {
            method: 'GET',
            signal: AbortSignal.timeout(15000),
            next: { revalidate: CACHE_TTLS.LONG }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user (status: ${response.status})`);
        }
        
        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}