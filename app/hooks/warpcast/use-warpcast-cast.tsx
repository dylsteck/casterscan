import React from 'react';

interface WarpcastAuthor {
  fid: number;
  displayName: string;
  pfp: {
    url: string;
    verified: boolean;
  };
  profile: {
    bio: {
      text: string;
      mentions: any[];
    };
    location: {
      placeId: string;
      description: string;
    };
  };
  followerCount: number;
  followingCount: number;
  activeOnFcNetwork: boolean;
  viewerContext: {
    following: boolean;
  };
  username: string;
}

interface WarpcastEmbed {
  type: string;
  openGraph: {
    url: string;
    sourceUrl: string;
    title: string;
    domain: string;
    image: string;
    useLargeImage: boolean;
  };
  collection: {
    id: string;
    name: string;
    description: string;
    itemCount: number;
    ownerCount: number;
    farcasterOwnerCount: number;
    imageUrl: string;
    volumeTraded: string;
    mintUrl: string;
    openSeaUrl: string;
    schemaName: string;
  };
}

interface WarpcastCast {
  hash: string;
  threadHash: string;
  author: WarpcastAuthor;
  text: string;
  timestamp: number;
  mentions: any[];
  attachments: any;
  embeds: {
    images: any[];
    urls: WarpcastEmbed[];
    unknowns: any[];
    processedCastText: string;
  };
  ancestors: {
    count: number;
    casts: any[];
  };
  replies: {
    count: number;
    casts: any[];
  };
  reactions: {
    count: number;
  };
  recasts: {
    count: number;
  };
  watches: {
    count: number;
  };
  tags: any[];
  quoteCount: number;
  combinedRecastCount: number;
  warpsTipped: number;
  viewerContext: {
    reacted: boolean;
    recast: boolean;
    bookmarked: boolean;
  };
}

const useWarpcastCast = (hash: string) => {
  const [cast, setCast] = React.useState<WarpcastCast | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(
          `/api/casts/warpcast?hash=${hash}`, {
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