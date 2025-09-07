import { NextRequest } from 'next/server'
import { snapchain } from '../../../../lib/snapchain'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    const pageSize = request.nextUrl.searchParams.get('pageSize') || '1000'
    
    const data = await snapchain.getVerificationsByFid({ 
      fid, 
      pageSize: parseInt(pageSize) 
    })
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch verifications' }, { status: 500 })
  }
}
