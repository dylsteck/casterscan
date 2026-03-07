import { CACHE_TTLS } from "@/app/lib/utils";
import { apiFetch } from "@/app/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');

    if (!fid) {
        return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 });
    }

    try {
        const user = await apiFetch(`/v1/users/${fid}`);
        return NextResponse.json({ users: [user] }, { headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` } });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
