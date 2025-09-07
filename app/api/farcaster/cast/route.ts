import { cachedRequest, FARCASTER_API_URL, CACHE_TTLS } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    if (!hash) {
        return NextResponse.json({ error: "Missing required hash parameter" }, { status: 400 });
    }

    try {
        const responseData = await cachedRequest(`${FARCASTER_API_URL}/v2/thread-casts?castHash=${hash}`, CACHE_TTLS.LONG, 'GET', undefined, `farcaster:cast:${hash}`);
        
        return NextResponse.json(responseData);
    } catch (err) {
        console.error(`Error fetching cast ${hash}:`, err);
        // Return a structured error response instead of 500
        return NextResponse.json({ 
            error: "Failed to fetch cast", 
            details: err instanceof Error ? err.message : "Unknown error",
            hash: hash 
        }, { status: 200 }); // Return 200 with error data for client to handle
    }
}