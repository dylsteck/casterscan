import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    const signer = request.nextUrl.searchParams.get('signer')
    
    if (!signer) {
      return Response.json({ error: 'Signer parameter required' }, { status: 400 })
    }
    
    const endpoints = [
      `https://snap.farcaster.xyz:3381/v1/castsByFid?fid=${fid}&pageSize=1000`,
      `https://snap.farcaster.xyz:3381/v1/reactionsByFid?fid=${fid}&pageSize=1000`,
      `https://snap.farcaster.xyz:3381/v1/linksByFid?fid=${fid}&pageSize=1000`,
      `https://snap.farcaster.xyz:3381/v1/verificationsByFid?fid=${fid}&pageSize=1000`
    ]
    
    const responses = await Promise.all(
      endpoints.map(url => 
        fetch(url)
          .then(res => res.ok ? res.json() : { messages: [] })
          .catch(() => ({ messages: [] }))
      )
    )
    
    const [castsData, reactionsData, linksData, verificationsData] = responses as any[]
    
    const filterBySigner = (messages: any[]) => 
      messages.filter((msg: any) => msg.signer === signer || 
        (msg.data && msg.data.signer === signer))
    
    const casts = filterBySigner(castsData?.messages || [])
    const reactions = filterBySigner(reactionsData?.messages || [])
    const links = filterBySigner(linksData?.messages || [])
    const verifications = filterBySigner(verificationsData?.messages || [])
    
    const allMessages = [...casts, ...reactions, ...links, ...verifications]
    const lastUsed = allMessages.reduce((latest, msg) => {
      const timestamp = msg.data?.timestamp || msg.timestamp
      if (timestamp && (!latest || timestamp > latest)) {
        return timestamp
      }
      return latest
    }, null)
    
    return Response.json({
      casts: casts.length,
      reactions: reactions.length,
      links: links.length,
      verifications: verifications.length,
      lastUsed: lastUsed ? new Date(lastUsed * 1000).toISOString() : null
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch signer stats' }, { status: 500 })
  }
}
