// Neynar types
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
        mentioned_profiles: unknown[];
        mentioned_profiles_ranges: { start: number; end: number }[];
        mentioned_channels: unknown[];
        mentioned_channels_ranges: { start: number; end: number }[];
      };
      location?: unknown;
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
      primary: { eth_address: string; sol_address: string | null };
    };
    verified_accounts: { platform: string; username: string }[];
    power_badge: boolean;
  };
  app: unknown;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string | null;
  root_parent_url: string | null;
  parent_author: { fid: number | null };
  text: string;
  timestamp: string;
  embeds: { url: string; metadata?: unknown }[];
  channel: unknown;
  reactions: {
    likes_count: number;
    recasts_count: number;
    likes: { fid: number; fname: string }[];
    recasts: { fid: number; fname: string }[];
  };
  replies: { count: number };
  mentioned_profiles: unknown[];
  mentioned_profiles_ranges: unknown[];
  mentioned_channels: unknown[];
  mentioned_channels_ranges: unknown[];
  author_channel_context?: { following: boolean };
};

export type NeynarV2User = {
  object: "user";
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  pro?: { status: string; subscribed_at?: string; expires_at?: string };
  profile: {
    bio: {
      text: string;
      mentioned_profiles: unknown[];
      mentioned_profiles_ranges: { start: number; end: number }[];
      mentioned_channels: unknown[];
      mentioned_channels_ranges: { start: number; end: number }[];
    };
    location?: unknown;
    banner?: { url: string };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
    primary: { eth_address: string; sol_address: string | null };
  };
  verified_accounts: { platform: string; username: string }[];
  power_badge: boolean;
};

export type NeynarHubCast = {
  data: {
    type: string;
    fid: number;
    timestamp: number;
    network: string;
    castAddBody?: {
      embeds: unknown[];
      embedsDeprecated: string[];
      mentions: number[];
      mentionsPositions: number[];
      parentCastId?: { fid: number; hash: string };
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

export type NeynarCastOptions = {
  identifier: string;
  type: "url" | "hash";
};

export type NeynarUserOptions = { fid: string };
export type NeynarUsersOptions = { fids: string[] };
export type NeynarUserByUsernameOptions = { username: string };
export type NeynarCastByIdOptions = { fid: string; hash: string };

// Snapchain types
export type SnapchainCastId = {
  fid: number;
  hash: string;
};

export type SnapchainEmbed = {
  url?: string;
  castId?: SnapchainCastId;
};

export type SnapchainCastMessage = {
  hash: string;
  data: {
    type: "MESSAGE_TYPE_CAST_ADD" | "MESSAGE_TYPE_CAST_REMOVE";
    timestamp: number;
    fid: number;
    network: "FARCASTER_NETWORK_MAINNET" | "FARCASTER_NETWORK_TESTNET";
    castAddBody?: {
      text: string;
      embeds: SnapchainEmbed[];
      embedsDeprecated: string[];
      mentions: number[];
      mentionsPositions: number[];
      parentCastId?: SnapchainCastId;
      parentUrl?: string;
      type: "CAST_TYPE_CAST" | "CAST_TYPE_LONG_CAST";
    };
    castRemoveBody?: { targetHash: string };
  };
  signer: string;
  signature: string;
  signatureScheme: "SIGNATURE_SCHEME_ED25519" | "SIGNATURE_SCHEME_EIP712";
  hashScheme: "HASH_SCHEME_BLAKE3";
};

export type SnapchainReactionMessage = {
  hash: string;
  data: {
    type: "MESSAGE_TYPE_REACTION_ADD" | "MESSAGE_TYPE_REACTION_REMOVE";
    timestamp: number;
    fid: number;
    network: "FARCASTER_NETWORK_MAINNET" | "FARCASTER_NETWORK_TESTNET";
    reactionBody: {
      type: "REACTION_TYPE_LIKE" | "REACTION_TYPE_RECAST" | "REACTION_TYPE_NONE";
      targetCastId?: SnapchainCastId;
      targetUrl?: string;
    };
  };
  signer: string;
  signature: string;
  signatureScheme: "SIGNATURE_SCHEME_ED25519" | "SIGNATURE_SCHEME_EIP712";
  hashScheme: "HASH_SCHEME_BLAKE3";
};

export type SnapchainLinkMessage = {
  hash: string;
  data: {
    type: "MESSAGE_TYPE_LINK_ADD" | "MESSAGE_TYPE_LINK_REMOVE";
    timestamp: number;
    fid: number;
    network: "FARCASTER_NETWORK_MAINNET" | "FARCASTER_NETWORK_TESTNET";
    linkBody: {
      type: "follow" | "unfollow" | "LINK_TYPE_FOLLOW" | "LINK_TYPE_UNFOLLOW";
      targetFid?: number;
      displayTimestamp?: number | null;
    };
  };
  signer: string;
  signature: string;
  signatureScheme: "SIGNATURE_SCHEME_ED25519" | "SIGNATURE_SCHEME_EIP712";
  hashScheme: "HASH_SCHEME_BLAKE3";
};

export type SnapchainVerificationMessage = {
  hash: string;
  data: {
    type: "MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS" | "MESSAGE_TYPE_VERIFICATION_REMOVE";
    timestamp: number;
    fid: number;
    network: "FARCASTER_NETWORK_MAINNET" | "FARCASTER_NETWORK_TESTNET";
    verificationAddAddressBody?: {
      address: string;
      claimSignature: string;
      blockHash: string;
      verificationType: number;
      chainId: number;
      protocol: "PROTOCOL_ETHEREUM" | "PROTOCOL_SOLANA";
    };
    verificationRemoveBody?: { address: string };
  };
  signer: string;
  signature: string;
  signatureScheme: "SIGNATURE_SCHEME_ED25519" | "SIGNATURE_SCHEME_EIP712";
  hashScheme: "HASH_SCHEME_BLAKE3";
};

export type SnapchainSignerEventBody = {
  key: string;
  keyType: "KEY_TYPE_ED25519" | "KEY_TYPE_SECP256K1";
  eventType: "SIGNER_EVENT_TYPE_ADD" | "SIGNER_EVENT_TYPE_REMOVE";
  metadata: string;
  metadataType: "METADATA_TYPE_NONE" | "METADATA_TYPE_EIP_712";
};

export type SnapchainIdRegisterEventBody = {
  to: string;
  eventType: "ID_REGISTER_EVENT_TYPE_REGISTER" | "ID_REGISTER_EVENT_TYPE_TRANSFER";
  from: string;
};

export type SnapchainStorageRentEventBody = {
  payer: string;
  units: number;
  expiry: number;
};

export type SnapchainOnChainEvent = {
  type: "EVENT_TYPE_SIGNER" | "EVENT_TYPE_SIGNER_MIGRATED" | "EVENT_TYPE_ID_REGISTER" | "EVENT_TYPE_STORAGE_RENT";
  chainId: number;
  blockNumber: number;
  blockHash: string;
  blockTimestamp: number;
  transactionHash: string;
  logIndex: number;
  fid: number;
  signerEventBody?: SnapchainSignerEventBody;
  idRegisterEventBody?: SnapchainIdRegisterEventBody;
  storageRentEventBody?: SnapchainStorageRentEventBody;
};

export type SnapchainCastsResponse = {
  messages: SnapchainCastMessage[];
  nextPageToken?: string;
};

export type SnapchainReactionsResponse = {
  messages: SnapchainReactionMessage[];
  nextPageToken?: string;
};

export type SnapchainLinksResponse = {
  messages: SnapchainLinkMessage[];
  nextPageToken?: string;
};

export type SnapchainVerificationsResponse = {
  messages: SnapchainVerificationMessage[];
  nextPageToken?: string;
};

export type SnapchainOnChainSignersResponse = {
  events: SnapchainOnChainEvent[];
  nextPageToken?: string;
};

export type SnapchainInfoResponse = {
  dbStats: {
    numMessages: number;
    numFidRegistrations: number;
    approxSize: number;
  };
  numShards: number;
  shardInfos: Array<{
    shardId: number;
    maxHeight: number;
    numMessages: number;
    numFidRegistrations: number;
    approxSize: number;
    blockDelay: number;
    mempoolSize: number;
  }>;
  version: string;
  peer_id: string;
  nextEngineVersionTimestamp: number;
};

export type SnapchainEventResponse = {
  type: string;
  id: number;
  blockNumber: number;
  shardIndex: number;
  blockConfirmedBody?: {
    blockNumber: number;
    shardIndex: number;
    timestamp: number;
    blockHash: string;
    totalEvents: number;
  };
  fid?: number;
  timestamp?: number;
  network?: string;
  hash?: string;
  verificationAddAddressBody?: unknown;
};

export type SnapchainCastByIdResponse = {
  data: {
    type: "MESSAGE_TYPE_CAST_ADD";
    fid: number;
    timestamp: number;
    network: "FARCASTER_NETWORK_MAINNET" | "FARCASTER_NETWORK_TESTNET";
    castAddBody: {
      embeds: SnapchainEmbed[];
      embedsDeprecated: string[];
      mentions: number[];
      mentionsPositions: number[];
      parentCastId?: SnapchainCastId;
      parentUrl?: string;
      text: string;
      type: "CAST_TYPE_CAST" | "CAST_TYPE_LONG_CAST";
    };
  };
  hash: string;
  hashScheme: "HASH_SCHEME_BLAKE3";
  signature: string;
  signatureScheme: "SIGNATURE_SCHEME_ED25519" | "SIGNATURE_SCHEME_EIP712";
  signer: string;
};

export type SnapchainPaginationOptions = {
  pageSize?: number;
  pageToken?: string;
  reverse?: boolean;
};

export type SnapchainCastsByFidOptions = SnapchainPaginationOptions & { fid: string };
export type SnapchainReactionsByFidOptions = SnapchainPaginationOptions & {
  fid: string;
  reaction_type?: "REACTION_TYPE_LIKE" | "REACTION_TYPE_RECAST" | "REACTION_TYPE_NONE" | "None";
};
export type SnapchainLinksByFidOptions = SnapchainPaginationOptions & { fid: string };
export type SnapchainVerificationsByFidOptions = SnapchainPaginationOptions & { fid: string };
export type SnapchainOnChainSignersByFidOptions = SnapchainPaginationOptions & {
  fid: string;
  signer?: string;
};
export type SnapchainCastByIdOptions = { fid: string; hash: string };
export type SnapchainEventByIdOptions = { event_id: string; shard_index: string };

// Farcaster API types
export type FarcasterUserOptions = { fid: string };
export type FarcasterCastOptions = { hash: string };

// Keys types
export type ProfileKeysPage = {
  fid: bigint;
  authAddresses: `0x${string}`[];
  signerKeys: `0x${string}`[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};
