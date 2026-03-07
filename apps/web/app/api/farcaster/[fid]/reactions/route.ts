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
    const data = await apiFetch<{ reactions: unknown[] }>(`/v1/fids/${fid}/messages`)
    return Response.json({ messages: data.reactions }, {
      headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` }
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
});
