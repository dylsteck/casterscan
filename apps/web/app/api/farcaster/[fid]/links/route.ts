import { NextRequest } from 'next/server'
import { snapchain } from '../../../../lib/snapchain'
import { CACHE_TTLS } from '../../../../lib/utils'
import { withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) => {
  try {
    const { fid } = await params
    const pageSize = request.nextUrl.searchParams.get('pageSize') || '1000'
    
    const data = await snapchain.getLinksByFid({ 
      fid, 
      pageSize: parseInt(pageSize) 
    })
    return Response.json(data, {
      headers: {
        'Cache-Control': `max-age=${CACHE_TTLS.LONG}`
      }
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
});
