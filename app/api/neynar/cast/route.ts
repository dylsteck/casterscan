import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    try {
        const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY ?? "";
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/cast?identifier=${hash}&type=hash`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'api_key': `${apiKey}`
                }
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}