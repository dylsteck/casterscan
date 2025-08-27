import { useState, useEffect } from 'react';
import { SERVER_URL } from '@/lib/constants';

interface FidStats {
  casts: number;
  reactions: number;
  links: number;
  verifications: number;
}

export function useFidStats(fid: string) {
  const [stats, setStats] = useState<FidStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fid || !SERVER_URL) return;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoints = [
          `/api/hub/castsByFid?fid=${fid}`,
          `/api/hub/reactionsByFid?fid=${fid}`,
          `/api/hub/linksByFid?fid=${fid}`,
          `/api/hub/verificationsByFid?fid=${fid}`
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint => 
            fetch(`${SERVER_URL}${endpoint}`)
              .then(res => res.ok ? res.json() : { messages: [] })
              .catch(() => ({ messages: [] }))
          )
        );

        const [castsData, reactionsData, linksData, verificationsData] = responses;

        setStats({
          casts: castsData.messages?.length || 0,
          reactions: reactionsData.messages?.length || 0,
          links: linksData.messages?.length || 0,
          verifications: verificationsData.messages?.length || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [fid]);

  return { stats, isLoading, error };
}
