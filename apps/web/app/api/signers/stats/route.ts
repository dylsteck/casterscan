import { NextRequest } from 'next/server'
import { snapchain, SnapchainCastsResponse, SnapchainReactionsResponse, SnapchainLinksResponse, SnapchainVerificationsResponse, SnapchainMessage } from '../../../lib/snapchain'
import { CACHE_TTLS } from '../../../lib/utils'
import { withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (
  request: NextRequest
) => {
  try {
    const fid = request.nextUrl.searchParams.get('fid')
    const signer = request.nextUrl.searchParams.get('signer')
    
    if (!fid) {
      return Response.json({ error: 'FID parameter required' }, { status: 400 })
    }
    
    if (!signer) {
      return Response.json({ error: 'Signer parameter required' }, { status: 400 })
    }
    
    const responses = await Promise.all([
      snapchain.getCastsByFid({ fid, pageSize: 1000 }).catch(() => ({ messages: [] })),
      snapchain.getReactionsByFid({ fid, pageSize: 1000 }).catch(() => ({ messages: [] })),
      snapchain.getLinksByFid({ fid, pageSize: 1000 }).catch(() => ({ messages: [] })),
      snapchain.getVerificationsByFid({ fid, pageSize: 1000 }).catch(() => ({ messages: [] }))
    ])
    
    const [castsData, reactionsData, linksData, verificationsData] = responses
    
    const filterBySigner = (messages: SnapchainMessage[]) => 
      messages.filter((msg: SnapchainMessage) => msg.signer === signer)
    
    const casts = filterBySigner(castsData.messages || [])
    const reactions = filterBySigner(reactionsData.messages || [])
    const links = filterBySigner(linksData.messages || [])
    const verifications = filterBySigner(verificationsData.messages || [])
    
    const allMessages = [...casts, ...reactions, ...links, ...verifications]
    const lastUsed = allMessages.reduce((latest: number | null, msg) => {
      const timestamp = msg.data.timestamp
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
    }, {
      headers: {
        'Cache-Control': `max-age=${CACHE_TTLS.LONG}`
      }
    })
  } catch (error) {
    console.error('Error fetching signer stats:', error)
    return Response.json({ error: 'Failed to fetch signer stats' }, { status: 500 })
  }
});
