import { NEYNAR_API_URL, CACHE_TTLS } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const identifier = url.searchParams.get('identifier');
    const type = url.searchParams.get('type');

    try {
        const apiKey = process.env.NEYNAR_API_KEY ?? "";
        const response = await fetch(`${NEYNAR_API_URL}/v2/farcaster/cast?identifier=${identifier}&type=${type}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': `${apiKey}`
            },
            signal: AbortSignal.timeout(15000),
            next: { revalidate: CACHE_TTLS.LONG }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch cast (status: ${response.status})`);
        }
        
        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}