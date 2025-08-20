import { cachedRequest, NEYNAR_HUB_API_URL, WARPCAST_HUB_URLS } from '@/app/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const fid = url.searchParams.get('fid');
  const hash = url.searchParams.get('hash');
  const type = url.searchParams.get('type');

  if (!fid || !hash || !type) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    let apiUrl = '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (type === 'neynar') {
      const apiKey = process.env.NEYNAR_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'Neynar API key is missing' }, { status: 400 });
      }
      apiUrl = `${NEYNAR_HUB_API_URL}/v1/castById?fid=${fid}&hash=${hash}`;
      headers['x-api-key'] = apiKey;
    } else if (type === 'warpcast') {
      const randomUrl = WARPCAST_HUB_URLS[Math.floor(Math.random() * WARPCAST_HUB_URLS.length)];
      apiUrl = `${randomUrl}/v1/castById?fid=${fid}&hash=${hash}`;
    }

    const responseData = await cachedRequest(apiUrl, 86400, 'GET', headers, `hub:${type}:cast:${fid}:${hash}`);
    return NextResponse.json(responseData);
  } catch (err) {
    console.error('Error fetching cast from API:', err);
    return NextResponse.json({ error: 'Failed to fetch cast' }, { status: 500 });
  }
}
