import { CACHE_TTLS } from "@/app/lib/utils";
import { neynar, type NeynarCastOptions } from "@/app/lib/neynar";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const identifier = url.searchParams.get('identifier');
    const type = url.searchParams.get('type');

    try {
        const cast = await neynar.getCast({ identifier: identifier!, type: type as NeynarCastOptions['type'] });
        return NextResponse.json({ cast }, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}