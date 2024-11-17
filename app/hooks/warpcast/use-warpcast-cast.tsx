import { WarpcastCast } from '@/app/lib/types';
import React from 'react';

const useWarpcastCast = (hash: string) => {
  const [cast, setCast] = React.useState<WarpcastCast | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(
          `/api/warpcast/cast?hash=${hash}`, {
            method: 'GET'
        });
        const json = await response.json();
        if (Array.isArray(json.result.casts)) {
            const newCast = json.result.casts.find((cast: { hash: string }) => cast.hash === hash);
            setCast(newCast);
        } else {
            // no cast found
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cast');
        setLoading(false);
      }
    };

    fetchCast();
  }, [hash]);

  return { cast, loading, error };
};

export default useWarpcastCast;