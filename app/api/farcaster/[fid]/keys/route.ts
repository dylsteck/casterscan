import { NextRequest, NextResponse } from 'next/server';
import { fetchKeysForFid } from '@/app/lib/farcaster/keys';
import { CACHE_TTLS } from '@/app/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const resolvedParams = await params;
    const { fid } = resolvedParams;
    const url = new URL(request.url);
    
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '250', 10);

    if (!fid || isNaN(parseInt(fid))) {
      return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
    }

    const fidBigInt = BigInt(fid);
    const keysData = await fetchKeysForFid(fidBigInt, page, pageSize);

    // Convert bigint to string for JSON serialization
    const response = {
      ...keysData,
      fid: fid, // Keep as string for API response
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `max-age=${CACHE_TTLS.LONG}`,
      },
    });
  } catch (error) {
    console.error('Error fetching keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keys' },
      { status: 500 }
    );
  }
}
