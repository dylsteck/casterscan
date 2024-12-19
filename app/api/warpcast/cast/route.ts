import { cachedRequest, WARPCAST_API_URL } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    try {
        const responseData = await cachedRequest(`${WARPCAST_API_URL}/v2/thread-casts?castHash=${hash}`, 3600, 'GET');
        return NextResponse.json(responseData);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}