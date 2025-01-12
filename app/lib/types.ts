export type Client = {
  castLink: string;
  icon: React.FunctionComponentElement<{ className?: string }>;
  name: string;
};

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

export type HubStreamCast = {
  author: WarpcastUser;
  castAddBody?: never;
  embeds: any[];
  hash: string;
  text: string;
  timestamp: string;
};

export type NeynarV1Cast = {
  author: User;
  embeds: { url: string }[];
  hash: string;
  mentionedProfiles: User[];
  parentHash: string | null;
  parentUrl: string | null;
  threadHash: string;
  text: string;
  timestamp: string;
  type?: "cast-mention" | "cast-reply";
};

export type NeynarV2Cast = {
  author: {
      active_status: string;
      display_name: string;
      fid: number;
      object: string;
      pfp_url: string;
      power_badge: boolean;
      profile: {
          bio: {
              text: string;
          };
      };
      custody_address: string;
      follower_count: number;
      following_count: number;
      username: string;
      verifications: string[];
      verified_addresses: {
          eth_addresses: string[];
          sol_addresses: string[];
      };
  };
  ancestors: {
      cast: any[];
      count: number;
  };
  embeds: {
      url: string;
  }[];
  hash: string;
  mentioned_profiles: {
      active_status: string;
      custody_address: string;
      display_name: string;
      fid: number;
      object: string;
      pfp_url: string;
      power_badge: boolean;
      profile: {
          bio: {
              mentioned_profiles: any[];
              text: string;
          };
      };
      follower_count: number;
      following_count: number;
      username: string;
      verifications: string[];
      verified_addresses: {
          eth_addresses: string[];
          sol_addresses: string[];
      };
  }[];
  parent_hash: string | null;
  parent_url: string | null;
  reactions: {
      count?: never;
      likes: {
          fid: number;
          fname: string;
      }[];
      likes_count: number;
      recasts: {
          fid: number;
          fname: string;
      }[];
      recasts_count: number;
  };
  root_parent_url: string | null;
  replies: {
      cast: any[];
      count: number;
  };
  text: string;
  thread_hash: string;
  timestamp: string;
  type?: never;
};

export type User = {
  custodyAddress: string;
  displayName: string;
  fid: number;
  followerCount: number;
  followingCount: number;
  pfp: {
      url: string;
  };
  profile: {
      bio: {
          mentionedProfiles: string[];
          text: string;
      };
  };
  username: string;
  verifications: string[];
  viewerContext?: UserViewerContext;
};

export type WarpcastCast = {
  activeOnFcNetwork: boolean;
  ancestors: {
      cast: any[];
      count: number;
  };
  author: {
      activeOnFcNetwork: boolean;
      displayName: string;
      fid: number;
      followerCount: number;
      followingCount: number;
      pfp: {
          url: string;
          verified: boolean;
      };
      profile: {
          bio: {
              mentions: any[];
              text: string;
          };
          location: {
              description: string;
              placeId: string;
          };
      };
      username: string;
      viewerContext: WarpcastCastViewerContext;
  };
  bookmarks?: never;
  combinedRecastCount: number;
  displayName: string;
  embeds: {
      collection: {
          description: string;
          id: string;
          imageUrl: string;
          itemCount: number;
          mintUrl: string;
          name: string;
          openSeaUrl: string;
          schemaName: string;
          volumeTraded: string;
          ownerCount: number;
          farcasterOwnerCount: number;
      };
      images: any[];
      processedCastText: string;
      urls: {
          domain: string;
          openGraph: {
              domain: string;
              image: string;
              sourceUrl: string;
              title: string;
              type: string;
              url: string;
              useLargeImage: boolean;
          };
          type: string;
          url: string;
      }[];
      unknowns: any[];
  };
  fid: number;
  hash: string;
  mentions: any[];
  parentHash: string;
  parentUrl: string;
  quoteCount: number;
  recasts: {
      count: number;
  };
  reactions: {
      count: number;
  };
  replies: {
      cast: any[];
      count: number;
  };
  tags: any[];
  threadHash: string;
  text: string;
  timestamp: number;
  watches: {
      count: number;
  };
  warpsTipped: number;
  viewerContext: WarpcastCastViewerContext;
};

export type WarpcastUser = {
  collectionsOwned: any[];
  extras: {
      custodyAddress: string;
      ethWallets: string[];
      fid: number;
      solanaWallets: string[];
  };
  user: {
      connectedAccounts: {
          connectedAccountId: string;
          expired: boolean;
          platform: string;
          username: string;
      }[];
      displayName: string;
      fid: number;
      followerCount: number;
      followingCount: number;
      location: {
          description: string;
          placeId: string;
      };
      pfp: {
          url: string;
          verified: boolean;
      };
      profile: {
          bio: {
              channelMentions: string[];
              mentions: string[];
              text: string;
          };
          location: {
              description: string;
              placeId: string;
          };
      };
      username: string;
      viewerContext: WarpcastUserViewerContext;
  };
};

type UserViewerContext = {
  followedBy: boolean;
  following: boolean;
  liked?: boolean;
  recasted?: boolean;
};

type WarpcastCastViewerContext = {
  bookmarked: boolean;
  recast: boolean;
  reacted: boolean;
};

type WarpcastUserViewerContext = {
  canSendDirectCasts: boolean;
  followedBy: boolean;
  following: boolean;
  enableNotifications: boolean;
  hasUploadedInboxKeys: boolean;
};