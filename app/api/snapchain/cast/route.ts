import { NEYNAR_HUB_API_URL, CACHE_TTLS } from "@/app/lib/utils";
import { snapchain } from "@/app/lib/snapchain";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');
    const hash = url.searchParams.get('hash');
    const type = url.searchParams.get('type');

    if (!fid || !hash || !type) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        let apiUrl = '';
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (type === 'neynar') {
            const apiKey = process.env.NEYNAR_API_KEY;
            if (!apiKey) {
                return NextResponse.json({ error: "Neynar API key is missing" }, { status: 400 });
            }
            apiUrl = `${NEYNAR_HUB_API_URL}/v1/castById?fid=${fid}&hash=${hash}`;
            headers['x-api-key'] = apiKey;
        } else {
            const responseData = await snapchain.getCastById({ fid, hash });
            return NextResponse.json(responseData);
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(15000),
            next: { revalidate: CACHE_TTLS.LONG }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${apiUrl} (status: ${response.status})`);
        }
        
        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (err) {
        console.error('Error fetching cast from API:', err);
        // Return a structured error response instead of 500
        return NextResponse.json({ 
            error: "Failed to fetch cast", 
            details: err instanceof Error ? err.message : "Unknown error",
            type: type 
        }, { status: 200 }); // Return 200 with error data for client to handle
    }
}