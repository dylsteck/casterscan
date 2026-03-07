import { NextRequest } from 'next/server'
import { apiFetch } from '@/app/lib/api';
import { CACHE_TTLS } from '../../../../lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    const data = await apiFetch<{ casts: unknown[] }>(`/v1/fids/${fid}/messages`)
    return Response.json({ messages: data.casts }, {
      headers: { 'Cache-Control': `max-age=${CACHE_TTLS.FIFTEEN_MIN}` }
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch casts' }, { status: 500 })
  }
}
