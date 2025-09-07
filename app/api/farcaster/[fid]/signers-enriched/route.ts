import { NextRequest } from 'next/server'
import { decodeAbiParameters, bytesToHex } from 'viem'
import { snapchain, SnapchainOnChainSignersResponse, SnapchainCastMessage, SnapchainReactionMessage, SnapchainLinkMessage, SnapchainVerificationMessage, SnapchainOnChainEvent } from '../../../../lib/snapchain'
import { CACHE_TTLS } from '../../../../lib/utils'
import { neynar } from '../../../../lib/neynar'
import { signedKeyRequestAbi } from '../../../../lib/farcaster/abi/signed-key-request-abi'

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


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    
    const [signersData, userCasts, userReactions, userLinks, userVerifications] = await Promise.all([
      snapchain.getOnChainSignersByFid({ fid, pageSize: 1000 }).catch((): SnapchainOnChainSignersResponse => ({ events: [] })),
      snapchain.getAllCastsByFid(fid),
      snapchain.getAllReactionsByFid(fid, 'None'),
      snapchain.getAllLinksByFid(fid),
      snapchain.getAllVerificationsByFid(fid)
    ])

    const addSigners = signersData.events?.filter(
      (s) => s.signerEventBody?.eventType === 'SIGNER_EVENT_TYPE_ADD'
    ) || []

    function farcasterTimeToDate(time: number): Date {
      const FARCASTER_EPOCH = 1609459200;
      return new Date((FARCASTER_EPOCH + time) * 1000);
    }


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
      if (!signer.signerEventBody) continue
      
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
          const user = await neynar.getUser({ fid: app.fid.toString() });
          if (user) {
            app.profile = user;
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
