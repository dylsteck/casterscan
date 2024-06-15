import React from 'react';

interface NeynarCastResponse {
  object: string;
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string | null;
  root_parent_url: string | null;
  parent_author: {
    fid: number | null;
  };
  author: {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
      };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    active_status: string;
    power_badge: boolean;
  };
  text: string;
  timestamp: string;
  embeds: {
    url: string;
  }[];
  reactions: {
    likes_count: number;
    recasts_count: number;
    likes: {
      fid: number;
      fname: string;
    }[];
    recasts: {
      fid: number;
      fname: string;
    }[];
  };
  replies: {
    count: number;
  };
  mentioned_profiles: {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
        mentioned_profiles: any[];
      };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    active_status: string;
    power_badge: boolean;
  }[];
}

const useNeynarCast = (hash: string) => {
  const [cast, setCast] = React.useState<NeynarCastResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/cast?identifier=${hash}&type=hash`,
          {
            method: 'GET',
            headers: {
              'api_key': `${process.env.NEXT_PUBLIC_NEYNAR_API_KEY ?? ""}`
            }
          }
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
  }, [hash]);

  return { cast, loading, error };
};

export default useNeynarCast;