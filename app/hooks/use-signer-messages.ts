import { useQuery } from '@tanstack/react-query';
import { snapchain, SnapchainMessage } from '../lib/snapchain';

export function useSignerMessages(fid: string, signerKey: string) {
  return useQuery({
    queryKey: ['signer-messages', fid, signerKey],
    queryFn: async (): Promise<SnapchainMessage[]> => {
      const [casts, reactions, links, verifications] = await Promise.all([
        snapchain.getAllCastsByFid(fid),
        snapchain.getAllReactionsByFid(fid, 'None'),
        snapchain.getAllLinksByFid(fid),
        snapchain.getAllVerificationsByFid(fid)
      ]);

      const allMessages = [
        ...casts.map((m: SnapchainMessage) => ({ ...m, messageType: 'cast' })),
        ...reactions.map((m: SnapchainMessage) => ({ ...m, messageType: 'reaction' })),
        ...links.map((m: SnapchainMessage) => ({ ...m, messageType: 'link' })),
        ...verifications.map((m: SnapchainMessage) => ({ ...m, messageType: 'verification' }))
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
