import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/app/lib/api';
import { CACHE_TTLS } from '@/app/lib/utils';
import { withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) => {
  try {
    const resolvedParams = await params;
    const { fid } = resolvedParams;
    if (!fid || isNaN(parseInt(fid))) {
      return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
    }

    const keysData = await apiFetch<{ fid: string; authAddresses: `0x${string}`[]; signerKeys: `0x${string}`[]; page: number; pageSize: number; hasMore: boolean }>(
      `/v1/fids/${fid}/keys`
    );

    return NextResponse.json({ ...keysData, fid }, {
      headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` },
    });
  } catch (error) {
    console.error('Error fetching keys:', error);
    return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
  }
});
