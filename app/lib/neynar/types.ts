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
};

export type User = {
  object: "user";
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
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
  power_badge: boolean;
};

export type NeynarErrorCode = 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNAUTHORIZED';

export type NeynarCastOptions = {
  identifier: string;
  type: 'url' | 'hash';
};

export type NeynarUserOptions = {
  fid: string;
};

export type NeynarUsersOptions = {
  fids: string[];
};

export type NeynarUserByUsernameOptions = {
  username: string;
};

export type NeynarCastByIdOptions = {
  fid: string;
  hash: string;
};

export type NeynarHubCast = {
  data: {
    type: string;
    fid: number;
    timestamp: number;
    network: string;
    castAddBody?: {
      embeds: any[];
      embedsDeprecated: string[];
      mentions: number[];
      mentionsPositions: number[];
      parentCastId?: {
        fid: number;
        hash: string;
      };
      parentUrl?: string;
      text: string;
      type: string;
    };
  };
  hash: string;
  hashScheme: string;
  signature: string;
  signatureScheme: string;
  signer: string;
};
