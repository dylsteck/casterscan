import { NextRequest } from 'next/server'
import { decodeAbiParameters, bytesToHex } from 'viem'

const signedKeyRequestAbi = [
  {
    components: [
      { name: "requestFid", type: "uint256" },
      { name: "requestSigner", type: "address" },
      { name: "signature", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ],
    name: "SignedKeyRequest",
    type: "tuple",
  },
] as const;

function decodeSignerMetadata(metadata: string) {
  try {
    const metadataHex = `0x${Buffer.from(metadata, 'base64').toString('hex')}` as `0x${string}`;
    const decoded = decodeAbiParameters(signedKeyRequestAbi, metadataHex)[0];
    
    return {
      requestFid: Number(decoded.requestFid),
      requestSigner: decoded.requestSigner,
      signature: decoded.signature,
      deadline: Number(decoded.deadline),
    };
  } catch (error) {
    console.warn('Failed to decode signer metadata:', error);
    return null;
  }
}

async function getAllMessages(endpoint: string, fid: string, otherParams: Record<string, string> = {}) {
  const messages: any[] = []
  let nextPageToken: string | undefined

  while (true) {
    const params = new URLSearchParams({
      fid,
      pageSize: '1000',
      reverse: 'true',
      ...otherParams
    })

    if (nextPageToken) {
      params.append('pageToken', nextPageToken)
    }

    const response = await fetch(`https://snap.farcaster.xyz:3381${endpoint}?${params}`)
    if (!response.ok) break

    const data = await response.json()
    messages.push(...(data.messages || []))

    if (!data.nextPageToken || data.messages?.length < 1000) {
      break
    }

    nextPageToken = data.nextPageToken
  }

  return messages
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    
    const [signersData, userCasts, userReactions, userLinks, userVerifications] = await Promise.all([
      fetch(`https://snap.farcaster.xyz:3381/v1/onChainSignersByFid?fid=${fid}&pageSize=1000`).then(res => res.ok ? res.json() : { events: [] }),
      getAllMessages('/v1/castsByFid', fid),
      getAllMessages('/v1/reactionsByFid', fid, { reaction_type: 'None' }),
      getAllMessages('/v1/linksByFid', fid),
      getAllMessages('/v1/verificationsByFid', fid)
    ])

    const addSigners = signersData.events?.filter(
      (s: any) => s.signerEventBody?.eventType === 'SIGNER_EVENT_TYPE_ADD'
    ) || []

    function farcasterTimeToDate(time: number): Date {
      const FARCASTER_EPOCH = 1609459200;
      return new Date((FARCASTER_EPOCH + time) * 1000);
    }

    console.log(`User ${fid} total messages: ${userCasts.length} casts, ${userReactions.length} reactions, ${userLinks.length} links, ${userVerifications.length} verifications`)

    const messagesBySigner: Record<string, any> = {}
    const allUserMessages = [
      ...userCasts.map((m: any) => ({ ...m, type: 'cast' })),
      ...userReactions.map((m: any) => ({ ...m, type: 'reaction' })),
      ...userLinks.map((m: any) => ({ ...m, type: 'link' })),
      ...userVerifications.map((m: any) => ({ ...m, type: 'verification' }))
    ]

    for (const message of allUserMessages) {
      const signerKey = message.signer
      if (!messagesBySigner[signerKey]) {
        messagesBySigner[signerKey] = {
          casts: 0,
          reactions: 0,
          links: 0,
          verifications: 0,
          total: 0,
          lastUsed: null
        }
      }

      if (message.type === 'cast') messagesBySigner[signerKey].casts++
      else if (message.type === 'reaction') messagesBySigner[signerKey].reactions++
      else if (message.type === 'link') messagesBySigner[signerKey].links++
      else if (message.type === 'verification') messagesBySigner[signerKey].verifications++
      
      messagesBySigner[signerKey].total++

      const timestamp = message.data?.timestamp || message.timestamp
      if (timestamp) {
        const messageDate = farcasterTimeToDate(timestamp)
        if (!messagesBySigner[signerKey].lastUsed || messageDate > new Date(messagesBySigner[signerKey].lastUsed)) {
          messagesBySigner[signerKey].lastUsed = messageDate.toISOString()
        }
      }
    }

    const appsMap: Record<string, any> = {}

    for (const signer of addSigners) {
      const metadata = decodeSignerMetadata(signer.signerEventBody.metadata)
      if (!metadata || metadata.requestFid === 0) continue

      const appFid = metadata.requestFid.toString()
      const signerKey = signer.signerEventBody.key
      
      if (!appsMap[appFid]) {
        appsMap[appFid] = {
          fid: metadata.requestFid,
          signers: [],
          totalMessages: 0,
          lastUsed: null,
          appStats: {
            casts: 0,
            reactions: 0,
            links: 0,
            verifications: 0,
          }
        }
      }

      const signerStats = messagesBySigner[signerKey] || {
        casts: 0,
        reactions: 0,
        links: 0,
        verifications: 0,
        total: 0,
        lastUsed: null
      }

      const processedSigner = {
        key: signerKey,
        keyType: signer.signerEventBody.keyType,
        eventType: signer.signerEventBody.eventType,
        blockNumber: signer.blockNumber,
        transactionHash: signer.transactionHash,
        blockTimestamp: signer.blockTimestamp,
        metadata,
        messageStats: signerStats,
      }

      appsMap[appFid].signers.push(processedSigner)
      appsMap[appFid].totalMessages += signerStats.total
      appsMap[appFid].appStats.casts += signerStats.casts
      appsMap[appFid].appStats.reactions += signerStats.reactions
      appsMap[appFid].appStats.links += signerStats.links
      appsMap[appFid].appStats.verifications += signerStats.verifications

      if (signerStats.lastUsed) {
        const signerLastUsed = new Date(signerStats.lastUsed)
        if (!appsMap[appFid].lastUsed || signerLastUsed > new Date(appsMap[appFid].lastUsed)) {
          appsMap[appFid].lastUsed = signerStats.lastUsed
        }
      }
    }

    const appsWithProfiles = await Promise.all(
      Object.values(appsMap).map(async (app: any) => {
        try {
          const neynarRes = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${app.fid}`,
            {
              headers: {
                'x-api-key': process.env.NEYNAR_API_KEY || '',
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (neynarRes.ok) {
            const neynarData = await neynarRes.json()
            if (neynarData.users && neynarData.users.length > 0) {
              app.profile = neynarData.users[0]
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch profile for FID ${app.fid}:`, error)
        }
        return app
      })
    )

    const sortedApps = appsWithProfiles.filter(app => app.totalMessages > 0).sort((a, b) => {
      const aLastUsed = a.lastUsed ? new Date(a.lastUsed).getTime() : 0
      const bLastUsed = b.lastUsed ? new Date(b.lastUsed).getTime() : 0
      return bLastUsed - aLastUsed
    })

    return Response.json(sortedApps)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch enriched signers' }, { status: 500 })
  }
}
