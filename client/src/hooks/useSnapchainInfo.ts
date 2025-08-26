import { useQuery } from '@tanstack/react-query';
import { useSnapchainNode } from '@/contexts/SnapchainContext';
import { SERVER_URL } from '@/lib/constants';

interface SnapchainInfo {
  dbStats: {
    numMessages: number;
    numFidRegistrations: number;
    approxSize: number;
  };
  numShards: number;
  shardInfos: Array<{
    shardId: number;
    maxHeight: number;
    numMessages: number;
    numFidRegistrations: number;
    approxSize: number;
    blockDelay: number;
    mempoolSize: number;
  }>;
  version: string;
  peer_id: string;
  nextEngineVersionTimestamp: number;
}



export function useSnapchainInfo() {
  const { nodeUrl } = useSnapchainNode();
  
  const fetchSnapchainInfo = async (): Promise<SnapchainInfo> => {
    const response = await fetch(`${SERVER_URL}/api/info`, {
      headers: {
        'X-Snapchain-Node': nodeUrl,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const { data: info, isLoading: loading, error } = useQuery({
    queryKey: ['snapchain-info', nodeUrl],
    queryFn: fetchSnapchainInfo,
    refetchInterval: 30000,
    retry: 3,
    staleTime: 25000,
  });

  return { 
    info: info || null, 
    loading, 
    error: error?.message || null 
  };
}
