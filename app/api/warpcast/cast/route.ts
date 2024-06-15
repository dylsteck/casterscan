import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    try {
        const regularBase = 'https://api.warpcast.com';
        const response = await fetch(
            `${regularBase}/v2/thread-casts?castHash=${hash}`, {
                method: 'GET'
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}