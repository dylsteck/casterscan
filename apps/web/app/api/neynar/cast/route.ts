import { CACHE_TTLS } from "@/app/lib/utils";
import { apiFetch } from "@/app/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const identifier = url.searchParams.get('identifier');
    const type = url.searchParams.get('type');

    if (!identifier || !type) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const hash = type === 'hash' ? identifier : identifier.match(/0x[a-fA-F0-9]+/)?.[0];
        if (!hash) {
            return NextResponse.json({ error: "Could not extract hash from identifier" }, { status: 400 });
        }
        const cast = await apiFetch(`/v1/casts/${hash}`);
        return NextResponse.json({ cast }, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}