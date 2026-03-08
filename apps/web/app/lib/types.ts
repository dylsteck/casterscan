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
          embedsDeprecated: unknown[];
          mentions: number[];
          mentionsPositions: number[];
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
  author: FarcasterUser;
  castAddBody?: never;
  embeds: { url?: string; castId?: { fid: number; hash: string } }[];
  hash: string;
  text: string;
  timestamp: string;
};

export type StreamCast = {
  hash: Uint8Array;
  fid: number;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  text: string;
};

export type SnapchainEvent = {
  type: 'CAST_ADD' | 'REACTION_ADD' | 'LINK_ADD' | 'VERIFICATION_ADD' | 'ON_CHAIN_EVENT' | 'OTHER';
  id: number;
  hash: string;
  timestamp: string;
  fid: number;
  author: { fid: number; username?: string; displayName?: string } | null;
  link: string;
  // Cast-specific fields
  text?: string;
  embeds?: { url?: string }[];
  mentions?: number[];
  parentCastId?: { fid: number; hash: string };
  parentUrl?: string;
  // Reaction-specific fields
  reactionType?: string;
  targetCastId?: { fid: number; hash: string };
  // Link-specific fields
  linkType?: string;
  targetFid?: number;
  // Verification-specific fields
  address?: string;
  // On-chain event fields
  chainEventType?: string;
  chainId?: number;
  blockNumber?: number;
  // Other event fields
  eventType?: string;
};

export type PruneEvent = SnapchainEvent & {
  pruneMessageBody?: {
    message?: {
      data?: {
        fid?: number;
        text?: string;
        castAddBody?: { text?: string };
      };
    };
  };
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
    object: "cast";
    hash: string;
    author: {
      object: "user";
      fid: number;
      username: string;
      display_name: string;
      pfp_url: string;
      custody_address: string;
      profile: {
        bio: {
          text: string;
          mentioned_profiles: {
            object: "user_dehydrated";
            fid: number;
            username: string;
            display_name: string;
            pfp_url: string;
            custody_address: string;
          }[];
          mentioned_profiles_ranges: {
            start: number;
            end: number;
          }[];
          mentioned_channels: {
            object: "channel_dehydrated";
            id: string;
            name: string;
            image_url: string;
          }[];
          mentioned_channels_ranges: {
            start: number;
            end: number;
          }[];
        };
        location: {
          latitude: number;
          longitude: number;
          address: {
            city: string;
            state: string;
            state_code: string;
            country: string;
            country_code: string;
          };
        };
      };
      follower_count: number;
      following_count: number;
      verifications: string[];
      verified_addresses: {
        eth_addresses: string[];
        sol_addresses: string[];
        primary: {
          eth_address: string;
          sol_address: string | null;
        };
      };
      verified_accounts: {
        platform: string;
        username: string;
      }[];
      power_badge: boolean;
    };
    app: {
      object: "user_dehydrated";
      fid: number;
      username: string;
      display_name: string;
      pfp_url: string;
      custody_address: string;
    };
    thread_hash: string;
    parent_hash: string | null;
    parent_url: string | null;
    root_parent_url: string | null;
    parent_author: {
      fid: number | null;
    };
    text: string;
    timestamp: string;
    embeds: {
      url: string;
      metadata: {
        content_type: string;
        content_length: number;
        _status: string;
        image: {
          width_px: number;
          height_px: number;
        };
      };
    }[];
    channel: {
      object: "channel_dehydrated";
      id: string;
      name: string;
      image_url: string;
    };
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
    mentioned_profiles: unknown[];
    mentioned_profiles_ranges: { start: number; end: number }[];
    mentioned_channels: unknown[];
    mentioned_channels_ranges: { start: number; end: number }[];
    author_channel_context: {
      following: boolean;
    };
};

export type NeynarV2User = {
  object: "user";
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  pro?: {
    status: string;
    subscribed_at?: string;
    expires_at?: string;
  };
  profile: {
    bio: {
      text: string;
      mentioned_profiles: {
        object: "user_dehydrated";
        fid: number;
        username: string;
        display_name: string;
        pfp_url: string;
        custody_address: string;
      }[];
      mentioned_profiles_ranges: {
        start: number;
        end: number;
      }[];
      mentioned_channels: {
        object: "channel_dehydrated";
        id: string;
        name: string;
        image_url: string;
      }[];
      mentioned_channels_ranges: {
        start: number;
        end: number;
      }[];
    };
    location?: {
      latitude: number;
      longitude: number;
      address: {
        city: string;
        state: string;
        state_code: string;
        country: string;
        country_code: string;
      };
    };
    banner?: {
      url: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
    primary: {
      eth_address: string;
      sol_address: string | null;
    };
  };
  verified_accounts: {
    platform: string;
    username: string;
  }[];
  power_badge: boolean;
  url?: string;
  score?: number;
  auth_addresses?: {
    address: string;
    app?: {
      object: "user_dehydrated";
      fid: number;
    };
  }[];
  experimental?: {
    neynar_user_score?: number;
  };
  viewer_context?: {
    following: boolean;
    followed_by: boolean;
    blocking: boolean;
    blocked_by: boolean;
  };
  active_status?: "active" | "inactive";
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
    mentions: unknown[];
    embeds: {
      images: {
        type: string;
        url: string;
        sourceUrl: string;
        media: {
          version: string;
          width: number;
          height: number;
          staticRaster: string;
          mimeType: string;
        };
        alt: string;
      }[];
      urls: unknown[];
      videos: unknown[];
      unknowns: unknown[];
      processedCastText: string;
      groupInvites: unknown[];
    };
    ancestors: {
      count: number;
      casts: {
        hash: string;
        threadHash: string;
        author: {
          fid: number;
          displayName: string;
          pfp: {
            url: string;
            verified: boolean;
          };
          profile: {
            bio: {
              text: string;
              mentions: string[];
            };
            location: {
              placeId: string;
              description: string;
            };
          };
          followerCount: number;
          followingCount: number;
          viewerContext: {
            following: boolean;
            blockedBy: boolean;
          };
        };
        castType: string;
        text: string;
        timestamp: number;
        mentions: unknown[];
        ancestors: {
          count: number;
        };
        replies: {
          count: number;
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
        tags: {
          type: string;
          id: string;
          name: string;
          imageUrl: string;
        }[];
        quoteCount: number;
        combinedRecastCount: number;
        warpsTipped: number;
        channel: {
          key: string;
          name: string;
          imageUrl: string;
          authorContext: {
            role: string;
            restricted: boolean;
            banned: boolean;
          };
          authorRole: string;
        };
        viewerContext: {
          reacted: boolean;
          recast: boolean;
          bookmarked: boolean;
        };
      }[];
    };
    replies: {
      count: number;
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
    tags: {
      type: string;
      id: string;
      name: string;
      imageUrl: string;
    }[];
    quoteCount: number;
    combinedRecastCount: number;
    warpsTipped: number;
    channel: {
      key: string;
      name: string;
      imageUrl: string;
      authorContext: {
        role: string;
        restricted: boolean;
        banned: boolean;
      };
      authorRole: string;
    };
    client: {
      fid: number;
      username: string;
      displayName: string;
      pfp: {
        url: string;
        verified: boolean;
      };
    };
    viewerContext: {
      reacted: boolean;
      recast: boolean;
      bookmarked: boolean;
    };
};
  
export type FarcasterUser = {
  collectionsOwned: unknown[];
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
      viewerContext: FarcasterUserViewerContext;
  };
};

type UserViewerContext = {
  followedBy: boolean;
  following: boolean;
  liked?: boolean;
  recasted?: boolean;
};

type FarcasterCastViewerContext = {
  bookmarked: boolean;
  recast: boolean;
  reacted: boolean;
};

type FarcasterUserViewerContext = {
  canSendDirectCasts: boolean;
  followedBy: boolean;
  following: boolean;
  enableNotifications: boolean;
  hasUploadedInboxKeys: boolean;
};

export type KeyType = 'AUTH' | 'SIGNER';