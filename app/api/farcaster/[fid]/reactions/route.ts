import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    const pageSize = request.nextUrl.searchParams.get('pageSize') || '1000'
    
    const response = await fetch(`https://snap.farcaster.xyz:3381/v1/reactionsByFid?fid=${fid}&pageSize=${pageSize}&reaction_type=None`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}
