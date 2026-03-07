import { CACHE_TTLS } from "@/app/lib/utils";
import { apiFetch } from "@/app/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { validateHash } from "@/app/lib/validate";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    if (!validateHash(hash)) {
        return NextResponse.json({ error: "Missing or invalid hash parameter" }, { status: 400 });
    }

    try {
        const responseData = await apiFetch(`/v1/casts/${encodeURIComponent(hash)}?format=farcaster-api`);
        return NextResponse.json(responseData, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        console.error(`Error fetching cast ${hash}:`, err);
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}