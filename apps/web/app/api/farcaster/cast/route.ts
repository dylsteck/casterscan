import { CACHE_TTLS } from "@/app/lib/utils";
import { apiFetch } from "@/app/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (request: NextRequest) => {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    if (!hash) {
        return NextResponse.json({ error: "Missing required hash parameter" }, { status: 400 });
    }

    try {
        const responseData = await apiFetch(`/v1/casts/${hash}?format=farcaster-api`);
        return NextResponse.json(responseData, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        console.error(`Error fetching cast ${hash}:`, err);
        return NextResponse.json({ 
            error: "Failed to fetch cast", 
            details: err instanceof Error ? err.message : "Unknown error",
            hash: hash 
        }, { status: 200 });
    }
});