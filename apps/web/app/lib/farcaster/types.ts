export type HubCast = {
  data: {
      author: {
          display_name: string;
          fid: number;
          pfp_url: string;
          username: string;
      };
      castAddBody: {
          embeds: {
              url: string;
          }[];
          embedsDeprecated: any[];
          mentions: any[];
          mentionsPositions: any[];
          parentUrl: string;
          text: string;
          type: string;
      };
      fid: number;
      network: string;
      reactions: {
          likes_count: number;
          recasts_count: number;
      };
      replies: {
          count: number;
      };
      timestamp: number;
      type: string;
  };
  hash: string;
  hashScheme: string;
  signature: string;
  signatureScheme: string;
  signer: string;
};

export type FarcasterCast = {
    hash: string;
    threadHash: string;
    parentSource?: {
      type: string;
      url: string;
    };
    author: {
      fid: number;
      username: string;
      displayName: string;
      pfp: {
        url: string;
        verified: boolean;
      };
      profile: {
        bio: {
          text: string;
          mentions: string[];
          channelMentions: string[];
        };
        location: {
          placeId: string;
          description: string;
        };
        earlyWalletAdopter?: boolean;
      };
      followerCount: number;
      followingCount: number;
      viewerContext: {
        following: boolean;
        blockedBy: boolean;
      };
    };
    text: string;
    timestamp: number;
    mentions: any[];
    embeds: {
      images: {
        type: string;
        url: string;
        sourceUrl: string;
        media: {
          version: string;
          width: number;
          height: number;
        };
      }[];
      urls: {
        type: string;
        url: string;
        openGraph: {
          url: string;
          sourceUrl: string;
          title: string;
          description: string;
          domain: string;
          image: string;
          logo: string;
          useLargeImage: boolean;
          strippedUrl: string;
        };
      }[];
      unknowns: any[];
    };
    replies: {
      count: number;
    };
    reactions: {
      count: number;
    };
    recasts: {
      count: number;
      recasters: {
        fid: number;
        username: string;
        displayName: string;
        pfp: {
          url: string;
          verified: boolean;
        };
      }[];
    };
    watches: {
      count: number;
    };
    recast: boolean;
    viewerContext: {
      reacted: boolean;
      recast: boolean;
      watched: boolean;
    };
};

export type FarcasterErrorCode = 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT';

export type FarcasterUserOptions = {
  fid: string;
};

export type FarcasterCastOptions = {
  hash: string;
};
