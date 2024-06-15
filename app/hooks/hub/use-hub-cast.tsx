import React from 'react';

interface HubCastResponse {
  data: {
    type: string;
    fid: number;
    timestamp: number;
    network: string;
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
  };
  hash: string;
  hashScheme: string;
  signature: string;
  signatureScheme: string;
  signer: string;
}

export const WARPCAST_HUB_URLS = [
  'https://hoyt.farcaster.xyz:2281',
  'https://lamia.farcaster.xyz:2281',
];

const useHubCast = (fid: number, hash: string, type: 'neynar' | 'warpcast') => {
  const [cast, setCast] = React.useState<HubCastResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchNeynarCast = async () => {
      const url = `https://hub-api.neynar.com/v1/castById?fid=${fid}&hash=${hash}`;
      const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;

      if (!apiKey) {
        setError('API key is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(url, {
          headers: {
            'api_key': apiKey,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch cast from Neynar Hub');
        const json = await response.json();
        setCast(json);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cast from Neynar Hub:', err);
        setError('Failed to fetch cast');
        setLoading(false);
      }
    };

    const fetchWarpcastCast = async () => {
      const url = `${WARPCAST_HUB_URLS[Math.floor(Math.random() * WARPCAST_HUB_URLS.length)]}/v1/castById?fid=${fid}&hash=${hash}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const fallbackUrl = WARPCAST_HUB_URLS.find(u => u !== url);
          const fallbackResponse = await fetch(`${fallbackUrl}/v1/castById?fid=${fid}&hash=${hash}`);
          if (!fallbackResponse.ok) throw new Error('Failed to fetch cast from both Warpcast Hub URLs');
          const json = await fallbackResponse.json();
          setCast(json);
        } else {
          const json = await response.json();
          setCast(json);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cast from Warpcast Hub:', err);
        setError('Failed to fetch cast');
        setLoading(false);
      }
    };

    if (type === 'neynar') {
      fetchNeynarCast();
    } else {
      fetchWarpcastCast();
    }
  }, [fid, hash, type]);

  return { cast, loading, error };
};

export default useHubCast;