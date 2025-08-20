import { cachedRequest, NEYNAR_API_URL } from '@/app/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const identifier = url.searchParams.get('identifier');
  const type = url.searchParams.get('type');

  try {
    const apiKey = process.env.NEYNAR_API_KEY ?? '';
    const responseData = await cachedRequest(
      `${NEYNAR_API_URL}/v2/farcaster/cast?identifier=${identifier}&type=${type}`,
      3600,
      'GET',
      {
        'Content-Type': 'application/json',
        'x-api-key': `${apiKey}`,
      },
      `neynar:cast:${type}:${identifier}`,
    );
    return NextResponse.json(responseData);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch cast' }, { status: 500 });
  }
}
