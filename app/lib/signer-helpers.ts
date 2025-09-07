import { NeynarV2User } from './types';

export interface SignerEvent {
  type: string;
  chainId: number;
  blockNumber: number;
  blockHash: string;
  blockTimestamp: number;
  transactionHash: string;
  logIndex: number;
  fid: number;
  signerEventBody: {
    key: string;
    keyType: number;
    eventType: string;
    metadata: string;
    metadataType: number;
  };
  txIndex: number;
}

export interface SignerMetadata {
  requestFid: number;
  requestSigner: string;
  signature: string;
  deadline: number;
}

export interface ProcessedSigner {
  key: string;
  keyType: number;
  eventType: string;
  blockNumber: number;
  transactionHash: string;
  blockTimestamp: number;
  metadata?: SignerMetadata;
  messageStats?: {
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
    total: number;
    lastUsed?: string;
  };
}

export interface AppWithSigners {
  fid: number;
  profile?: NeynarV2User;
  signers: ProcessedSigner[];
  totalMessages: number;
  lastUsed?: Date;
  appStats?: {
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
  };
}

export function processSignersData(
  signersData: { events: SignerEvent[] },
  messageStats: Record<string, any>
): Record<string, AppWithSigners> {
  const appMap: Record<string, AppWithSigners> = {};

  const addSigners = signersData.events.filter(
    (s) => s.signerEventBody?.eventType === 'SIGNER_EVENT_TYPE_ADD'
  );

  for (const signer of addSigners) {
    try {
      const metadata = decodeSignerMetadata(signer.signerEventBody.metadata);
      const appFid = metadata.requestFid.toString();
      
      if (!appMap[appFid]) {
        appMap[appFid] = {
          fid: metadata.requestFid,
          signers: [],
          totalMessages: 0,
        };
      }

      const signerKey = signer.signerEventBody.key;
      const stats = messageStats[signerKey];

      const processedSigner: ProcessedSigner = {
        key: signerKey,
        keyType: signer.signerEventBody.keyType,
        eventType: signer.signerEventBody.eventType,
        blockNumber: signer.blockNumber,
        transactionHash: signer.transactionHash,
        blockTimestamp: signer.blockTimestamp,
        metadata,
        messageStats: stats ? {
          casts: stats.casts || 0,
          reactions: stats.reactions || 0,
          links: stats.links || 0,
          verifications: stats.verifications || 0,
          total: (stats.casts || 0) + (stats.reactions || 0) + (stats.links || 0) + (stats.verifications || 0),
          lastUsed: stats.lastUsed,
        } : undefined,
      };

      appMap[appFid].signers.push(processedSigner);
      appMap[appFid].totalMessages += processedSigner.messageStats?.total || 0;

      if (stats?.lastUsed) {
        const lastUsedDate = new Date(stats.lastUsed);
        if (!appMap[appFid].lastUsed || lastUsedDate > appMap[appFid].lastUsed!) {
          appMap[appFid].lastUsed = lastUsedDate;
        }
      }
    } catch (error) {
      console.warn('Failed to process signer:', error);
    }
  }

  return appMap;
}

export function decodeSignerMetadata(metadata: string): SignerMetadata {
  try {
    const metadataBytes = Buffer.from(metadata, 'base64');
    const metadataHex = `0x${metadataBytes.toString('hex')}` as `0x${string}`;
    
    const { decodeAbiParameters } = require('viem');
    
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
    
    const decoded = decodeAbiParameters(signedKeyRequestAbi, metadataHex)[0];
    
    return {
      requestFid: Number(decoded.requestFid),
      requestSigner: decoded.requestSigner,
      signature: decoded.signature,
      deadline: Number(decoded.deadline),
    };
  } catch (error) {
    console.warn('Failed to decode signer metadata:', error);
    return {
      requestFid: 0,
      requestSigner: '0x0000000000000000000000000000000000000000',
      signature: '0x',
      deadline: 0,
    };
  }
}

export function formatSignerStats(stats?: ProcessedSigner['messageStats']): string {
  if (!stats) return '0 messages';
  
  const parts = [];
  if (stats.casts > 0) parts.push(`${stats.casts} casts`);
  if (stats.reactions > 0) parts.push(`${stats.reactions} reactions`);
  if (stats.links > 0) parts.push(`${stats.links} links`);
  if (stats.verifications > 0) parts.push(`${stats.verifications} verifications`);
  
  return parts.length > 0 ? parts.join(' • ') : '0 messages';
}

export function farcasterTimeToDate(time: number): Date {
  const FARCASTER_EPOCH = 1609459200;
  return new Date((FARCASTER_EPOCH + time) * 1000);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return years + " year" + (years !== 1 ? "s" : "");
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return months + " month" + (months !== 1 ? "s" : "");
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return days + " day" + (days !== 1 ? "s" : "");
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return hours + " hour" + (hours !== 1 ? "s" : "");
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return minutes + " minute" + (minutes !== 1 ? "s" : "");
  }
  
  const sec = Math.floor(seconds);
  return sec + " second" + (sec !== 1 ? "s" : "");
}
