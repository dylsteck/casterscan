import { NeynarV2Cast } from '@/app/lib/types';
import React from 'react';

const useNeynarCast = (identifier: string, type: 'url' | 'hash') => {
  const [cast, setCast] = React.useState<NeynarV2Cast | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(
          `/api/neynar/cast?identifier=${identifier}&type=${type}`
        );
        const json = await response.json();
        setCast(json.cast);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cast');
        setLoading(false);
      }
    };

    fetchCast();
  }, [identifier, type]);

  return { cast, loading, error };
};

export default useNeynarCast;