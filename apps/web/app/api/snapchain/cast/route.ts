import { CACHE_TTLS } from "@/app/lib/utils";
import { apiFetch } from "@/app/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { validateFid, validateHash } from "@/app/lib/validate";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');
    const hash = url.searchParams.get('hash');
    const type = url.searchParams.get('type');

    if (!validateFid(fid) || !validateHash(hash) || !type) {
        return NextResponse.json({ error: "Missing or invalid required parameters" }, { status: 400 });
    }

    try {
        const format = type === 'neynar' ? 'neynar-hub' : 'farcaster-hub';
        const responseData = await apiFetch(`/v1/casts/${encodeURIComponent(hash)}?format=${format}&fid=${encodeURIComponent(fid)}`);
        return NextResponse.json(responseData, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        console.error('Error fetching cast from API:', err);
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}