import { NextRequest } from 'next/server'
import { CACHE_TTLS } from '../../../lib/utils';
import { apiFetch } from '@/app/lib/api';

export async function GET(request: NextRequest) {
  try {
    const data = await apiFetch('/v1/snapchain/info')
    
    return Response.json(data, {
      headers: {
        'Cache-Control': `max-age=${CACHE_TTLS.SHORT}`
      }
    })
  } catch (error) {
    console.error('Error fetching info:', error)
    return Response.json(
      { error: 'Failed to fetch info' },
      { status: 500 }
    )
  }
}
