import { useQuery } from '@tanstack/react-query';

interface SignerMessage {
  hash: string;
  data: {
    type: string;
    timestamp: number;
    fid: number;
    castAddBody?: {
      text: string;
      embeds: any[];
      mentions: number[];
      parentCastId?: {
        fid: number;
        hash: string;
      };
    };
    castRemoveBody?: {
      targetHash: string;
    };
    reactionBody?: {
      type: string;
      targetCastId?: {
        fid: number;
        hash: string;
      };
    };
    linkBody?: {
      type: string;
      targetFid?: number;
    };
    verificationAddAddressBody?: {
      address: string;
      claimSignature: string;
      blockHash: string;
      verificationType: number;
      chainId: number;
    };
    verificationRemoveBody?: {
      address: string;
    };
  };
  signer: string;
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

export function useSignerMessages(fid: string, signerKey: string) {
  return useQuery({
    queryKey: ['signer-messages', fid, signerKey],
    queryFn: async (): Promise<SignerMessage[]> => {
      const [casts, reactions, links, verifications] = await Promise.all([
        getAllMessages('/v1/castsByFid', fid),
        getAllMessages('/v1/reactionsByFid', fid, { reaction_type: 'None' }),
        getAllMessages('/v1/linksByFid', fid),
        getAllMessages('/v1/verificationsByFid', fid)
      ]);

      const allMessages = [
        ...casts.map((m: any) => ({ ...m, messageType: 'cast' })),
        ...reactions.map((m: any) => ({ ...m, messageType: 'reaction' })),
        ...links.map((m: any) => ({ ...m, messageType: 'link' })),
        ...verifications.map((m: any) => ({ ...m, messageType: 'verification' }))
      ];

      const signerMessages = allMessages.filter(msg => 
        msg.signer === signerKey
      );

      signerMessages.sort((a, b) => {
        const aTime = a.data?.timestamp || 0;
        const bTime = b.data?.timestamp || 0;
        return bTime - aTime;
      });

      return signerMessages;
    },
    enabled: !!fid && !!signerKey,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
