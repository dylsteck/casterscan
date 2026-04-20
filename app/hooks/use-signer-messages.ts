import { useQuery } from "@tanstack/react-query";
import { CACHE_TTLS } from "../lib/utils";
import { apiClient } from "../lib/api-client";

export type SignerMessage = {
  signer: string;
  data?: { timestamp?: number; type?: string };
  timestamp?: number;
  messageType: string;
  [key: string]: unknown;
};

export function useSignerMessages(fid: string, signerKey: string) {
  return useQuery({
    queryKey: ["signer-messages", fid, signerKey],
    queryFn: async (): Promise<SignerMessage[]> =>
      apiClient.getSignerMessages(fid, signerKey) as Promise<SignerMessage[]>,
    enabled: !!fid && !!signerKey,
    staleTime: CACHE_TTLS.REACT_QUERY.STALE_TIME,
    gcTime: CACHE_TTLS.REACT_QUERY.GC_TIME,
  });
}
