import { NextRequest } from 'next/server'
import { apiFetch } from '@/app/lib/api';
import { CACHE_TTLS } from '../../../lib/utils'
import { validateFid, validateSignerKey } from '@/app/lib/validate';

export async function GET(request: NextRequest) {
  try {
    const fid = request.nextUrl.searchParams.get('fid')
    const signer = request.nextUrl.searchParams.get('signer')

    if (!validateFid(fid) || !validateSignerKey(signer)) {
      return Response.json({ error: 'fid and signer parameters required and must be valid' }, { status: 400 })
    }

    const data = await apiFetch<{ casts: number; reactions: number; links: number; verifications: number; lastUsed: string | null }>(
      `/v1/fids/${fid}/signers/${encodeURIComponent(signer)}/stats`
    );
    return Response.json(data, {
      headers: { 'Cache-Control': `max-age=${CACHE_TTLS.FIFTEEN_MIN}` }
    });
  } catch (error) {
    console.error('Error fetching signer stats:', error);
    return Response.json({ error: 'Failed to fetch signer stats' }, { status: 500 });
  }
}
