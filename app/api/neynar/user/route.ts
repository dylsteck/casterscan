import { CACHE_TTLS } from "@/app/lib/utils";
import { neynar } from "@/app/lib/neynar";
import { NextRequest, NextResponse } from "next/server";
import { withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (request: NextRequest) => {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');

    if (!fid) {
        return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 });
    }

    try {
        const user = await neynar.getUser({ fid: fid! });
        return NextResponse.json({ users: [user] }, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
});
