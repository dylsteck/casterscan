import { NextRequest } from 'next/server'
import { apiFetch } from '@/app/lib/api';
import { CACHE_TTLS } from '../../../../lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    const data = await apiFetch<{ verifications: unknown[] }>(`/v1/fids/${fid}/messages`)
    return Response.json({ messages: data.verifications }, {
      headers: { 'Cache-Control': `max-age=${CACHE_TTLS.LONG}` }
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch verifications' }, { status: 500 })
  }
}
