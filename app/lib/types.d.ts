export type Client = {
    name: string;
    icon: React.FunctionComponentElement<{ className?: string }>;
    castLink: string;
};

export type HubCast =  {
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

export type NeynarV1Cast = {
    hash: string;
    parentHash: string | null;
    parentUrl: string | null;
    threadHash: string;
    parentAuthor: {
        fid: string | null;
    };
    mentionedProfiles: Array<User>;
    author: User;
    text: string;
    timestamp: string;
    embeds: Array<{ url: string }>;
    type?: "cast-mention" | "cast-reply";
}

export type NeynarV2Cast = {
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

export type WarpcastCast = {
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
    };
    text: string;
    timestamp: number;
    mentions: any[];
    attachments: any;
    embeds: {
      images: any[];
      urls: {
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
      }[];
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
};  

export type User =  {
    fid: number;
    username: string;
    custodyAddress: string;
    displayName: string;
    pfp: {
        url: string;
    };
    profile: {
        bio: {
            text: string;
            mentionedProfiles: Array<string>;
        }
    };
    followerCount: number;
    followingCount: number;
    verifications: Array<string>;
    viewerContext?: {
        following: boolean;
        followedBy: boolean;
        liked?: boolean;
        recasted?: boolean;
    };
}