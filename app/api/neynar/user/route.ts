import { cachedRequest, NEYNAR_API_URL } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');

    if (!fid) {
        return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 });
    }

    try {
        const apiKey = process.env.NEYNAR_API_KEY ?? "";
        const responseData = await cachedRequest(
            `${NEYNAR_API_URL}/v2/farcaster/user/bulk?fids=${fid}`, 3600, 'GET', 
            {
                'Content-Type': 'application/json',
                'x-api-key': `${apiKey}`
            },
            `neynar:user:${fid}`
        );
        return NextResponse.json(responseData);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
