import { WARPCAST_HUB_URLS } from "@/app/consts";
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
        let apiUrl = '';
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (type === 'neynar') {
            const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
            if (!apiKey) {
                return NextResponse.json({ error: "Neynar API key is missing" }, { status: 400 });
            }
            apiUrl = `https://hub-api.neynar.com/v1/castById?fid=${fid}&hash=${hash}`;
            headers['api_key'] = apiKey;
        } else {
            const randomUrl = WARPCAST_HUB_URLS[Math.floor(Math.random() * WARPCAST_HUB_URLS.length)];
            apiUrl = `${randomUrl}/v1/castById?fid=${fid}&hash=${hash}`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cast from the selected hub');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error('Error fetching cast from API:', err);
        return NextResponse.json({ error: "Failed to fetch cast" }, { status: 500 });
    }
}