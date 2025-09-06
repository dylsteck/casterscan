import { NextRequest } from 'next/server'

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
    
    let url = `https://snap.farcaster.xyz:3381/v1/onChainSignersByFid?fid=${fid}&pageSize=${pageSize}&reverse=${reverse}`
    if (pageToken) url += `&pageToken=${pageToken}`
    if (signer) url += `&signer=${signer}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch signers' }, { status: 500 })
  }
}
