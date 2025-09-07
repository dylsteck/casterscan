import { NextRequest } from 'next/server'
import { snapchain } from '../../../../lib/snapchain'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    const pageSize = request.nextUrl.searchParams.get('pageSize') || '1000'
    const pageToken = request.nextUrl.searchParams.get('pageToken') || ''
    const reverse = request.nextUrl.searchParams.get('reverse') || 'false'
    const signer = request.nextUrl.searchParams.get('signer') || ''
    
    const data = await snapchain.getOnChainSignersByFid({
      fid,
      pageSize: parseInt(pageSize),
      reverse: reverse === 'true',
      ...(pageToken && { pageToken }),
      ...(signer && { signer })
    })
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch signers' }, { status: 500 })
  }
}
