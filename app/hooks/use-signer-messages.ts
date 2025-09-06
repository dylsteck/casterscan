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
  };
  signer: string;
}

export function useSignerMessages(fid: string, signerKey: string) {
  return useQuery({
    queryKey: ['signer-messages', fid, signerKey],
    queryFn: async (): Promise<SignerMessage[]> => {
      const endpoints = [
        `/api/farcaster/${fid}/casts`,
        `/api/farcaster/${fid}/reactions`,
        `/api/farcaster/${fid}/links`,
        `/api/farcaster/${fid}/verifications`
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint =>
          fetch(endpoint)
            .then(res => res.ok ? res.json() : { messages: [] })
            .catch(() => ({ messages: [] }))
        )
      );

      const allMessages = responses.flatMap(res => res.messages || []);
      const signerMessages = allMessages.filter(msg => 
        msg.signer === signerKey || (msg.data && msg.data.signer === signerKey)
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
