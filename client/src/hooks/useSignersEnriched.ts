import { useState, useEffect } from 'react';
import { SERVER_URL } from '@/lib/constants';

interface SignerMetadata {
  requestFid: number;
  requestSigner: string;
  signature: string;
  deadline: number;
}

interface EnrichedSigner {
  key: string;
  keyType: number;
  eventType: string;
  blockNumber: number;
  transactionHash: string;
  blockTimestamp: number;
  metadata?: SignerMetadata;
  appProfile?: {
    username?: string;
    display_name?: string;
    fid: number;
    pfp_url?: string;
  };
  messageStats?: {
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
    lastUsed?: string;
  };
}

interface SignersResponse {
  events: EnrichedSigner[];
}

export function useSignersEnriched(fid: string) {
  const [data, setData] = useState<SignersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fid || !SERVER_URL) return;

    const fetchEnrichedSigners = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First, get the basic signers data
        const signersRes = await fetch(`${SERVER_URL}/api/fids/${fid}/signers`);
        if (!signersRes.ok) throw new Error('Failed to fetch signers');
        
        const signersData = await signersRes.json();
        const enrichedSigners: EnrichedSigner[] = [];

        // Process only ADD signers and limit to first 10 to avoid too many requests
        const addSigners = (signersData.events || [])
          .filter((s: any) => s.signerEventBody?.eventType === 'SIGNER_EVENT_TYPE_ADD')
          .slice(0, 10);

        for (const signer of addSigners) {
          let enrichedSigner: EnrichedSigner = {
            key: signer.signerEventBody.key,
            keyType: signer.signerEventBody.keyType,
            eventType: signer.signerEventBody.eventType,
            blockNumber: signer.blockNumber,
            transactionHash: signer.transactionHash,
            blockTimestamp: signer.blockTimestamp,
          };

          // For now, just add basic signer info without metadata decoding
          // The metadata decoding can be added later when we have proper ABI decoding
          enrichedSigner.appProfile = {
            username: 'Unknown App',
            display_name: 'Unknown App',
            fid: 0,
          };

          // Add mock message stats for now
          enrichedSigner.messageStats = {
            casts: Math.floor(Math.random() * 100),
            reactions: Math.floor(Math.random() * 50),
            links: Math.floor(Math.random() * 20),
            verifications: Math.floor(Math.random() * 5),
            lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          };

          enrichedSigners.push(enrichedSigner);
        }

        setData({ events: enrichedSigners });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch enriched signers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrichedSigners();
  }, [fid]);

  return { data, isLoading, error };
}
