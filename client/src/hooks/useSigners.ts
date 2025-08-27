import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';

interface SignerEvent {
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

interface SignersResponse {
  events: SignerEvent[];
}

export function useSigners(fid: string) {
  return useQuery({
    queryKey: ['signers', fid],
    queryFn: async (): Promise<SignersResponse> => {
      const response = await fetch(`${SERVER_URL}/api/fids/${fid}/signers`);
      if (!response.ok) {
        throw new Error('Failed to fetch signers');
      }
      return response.json();
    },
    enabled: !!fid,
  });
}
