export type Client = {
  name: string;
  username: string;
  fid: number;
  icon: React.FunctionComponentElement<{ className?: string }>;
  castLink: string;
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
    mentioned_profiles: any[];
    mentioned_profiles_ranges: any[];
    mentioned_channels: any[];
    mentioned_channels_ranges: any[];
    author_channel_context: {
      following: boolean;
    };
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
          staticRaster: string;
          mimeType: string;
        };
        alt: string;
      }[];
      urls: any[];
      videos: any[];
      unknowns: any[];
      processedCastText: string;
      groupInvites: any[];
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
        mentions: any[];
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