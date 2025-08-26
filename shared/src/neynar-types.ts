export type NeynarV2User = {
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
  auth_addresses: {
    address: string;
    app: {
      object: "user_dehydrated";
      fid: number;
    };
  }[];
  verified_accounts: {
    platform: string;
    username: string;
  }[];
  power_badge: boolean;
};

export type NeynarV2Cast = {
  object: "cast";
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string | null;
  root_parent_url: string | null;
  parent_author: {
    fid: number;
  } | null;
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
  text: string;
  timestamp: string;
  embeds: {
    url: string;
    cast_id?: {
      fid: number;
      hash: string;
    };
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
  channel: {
    object: "channel_dehydrated";
    id: string;
    name: string;
    image_url: string;
  } | null;
  mentioned_profiles: {
    object: "user_dehydrated";
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
  }[];
  app: {
    object: "app_dehydrated";
    fid: number;
    display_name: string;
    pfp_url: string;
  };
};
