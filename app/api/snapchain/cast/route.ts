import { CACHE_TTLS } from "@/app/lib/utils";
import { neynar } from "@/app/lib/neynar";
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
        if (type === 'neynar') {
            const responseData = await neynar.getCastById({ fid: fid!, hash: hash! });
            return NextResponse.json(responseData);
        } else {
            const responseData = await snapchain.getCastById({ fid, hash });
            return NextResponse.json(responseData);
        }
    } catch (err) {
        console.error('Error fetching cast from API:', err);
        return NextResponse.json({ 
            error: "Failed to fetch cast", 
            details: err instanceof Error ? err.message : "Unknown error",
            type: type 
        }, { status: 200 });
    }
}