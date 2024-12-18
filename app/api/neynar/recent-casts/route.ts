import { NEYNAR_API_URL } from '@/app/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = searchParams.get('limit') || '75';

  const apiUrl = `${NEYNAR_API_URL}/v1/farcaster/recent-casts?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;

  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEYNAR_API_KEY || '',
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Neynar API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from Neynar API:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}