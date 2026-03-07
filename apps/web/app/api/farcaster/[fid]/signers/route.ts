import { NextRequest } from 'next/server'
import { apiFetch } from '@/app/lib/api';
import { CACHE_TTLS } from '../../../../lib/utils'
import { withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) => {
  try {
    const { fid } = await params
    const url = new URL(request.url)
    const pageSize = url.searchParams.get('pageSize') || '1000'
    const pageToken = url.searchParams.get('pageToken') || ''
    const reverse = url.searchParams.get('reverse') || 'false'
    const signer = url.searchParams.get('signer') || ''
    const qs = new URLSearchParams()
    if (pageSize) qs.set('pageSize', pageSize)
    if (pageToken) qs.set('pageToken', pageToken)
    if (reverse) qs.set('reverse', reverse)
    if (signer) qs.set('signer', signer)
    const query = qs.toString()
    const data = await apiFetch(`/v1/fids/${fid}/signers${query ? `?${query}` : ''}`)
    return Response.json(data, {
      headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` }
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch signers' }, { status: 500 })
  }
});
