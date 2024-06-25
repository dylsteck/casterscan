import React from 'react';

interface HubCastResponse {
  data: {
    type: string;
    fid: number;
    timestamp: number;
    network: string;
    author: {
      username: string;
      display_name: string;
      pfp_url: string;
      fid: number;
    };
    castAddBody: {
      embedsDeprecated: any[];
      mentions: any[];
      parentUrl: string;
      text: string;
      mentionsPositions: any[];
      embeds: {
        url: string;
      }[];
      type: string;
    };
    replies: {
      count: number;
    };
    reactions: {
      likes_count: number;
      recasts_count: number;
    };
  };
  hash: string;
  hashScheme: string;
  signature: string;
  signatureScheme: string;
  signer: string;
}

const useHubCast = (fid: number | null, hash: string, type: 'neynar' | 'warpcast' | 'pinata') => {
  const [cast, setCast] = React.useState<HubCastResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (fid === null) return;

    const fetchHubCast = async () => {
      try {
        const response = await fetch(`/api/hub/cast?fid=${fid}&hash=${hash}&type=${type}`);
        if (!response.ok) throw new Error('Failed to fetch cast from API');
        const json = await response.json();
        setCast(json);
      } catch (err) {
        console.error('Error fetching cast from API:', err);
        setError('Failed to fetch cast');
      } finally {
        setLoading(false);
      }
    };

    fetchHubCast();
  }, [fid, hash, type]);

  return { cast, loading, error };
};

export default useHubCast;