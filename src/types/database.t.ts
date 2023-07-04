enum UserDataType {
  USER_DATA_TYPE_NONE = 0,
  USER_DATA_TYPE_PFP = 1, // Profile Picture for the user
  USER_DATA_TYPE_DISPLAY = 2, // Display Name for the user
  USER_DATA_TYPE_BIO = 3, // Bio for the user
  USER_DATA_TYPE_URL = 5, // URL of the user
  USER_DATA_TYPE_FNAME = 6, // Preferred Farcaster Name for the user
}

export interface KyselyDB {
  messages: {
    id: bigint;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    pruned_at: string;
    revoked_at: string;
    timestamp: string;
    fid: bigint;
    message_type: number;
    hash: Buffer;
    hash_scheme: number;
    signature: Buffer;
    signature_scheme: number;
    signer: Buffer;
    raw: Buffer;
  };
  casts: {
    id: bigint;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    timestamp: string;
    fid: bigint;
    hash: String;
    parent_hash: Buffer | null;
    parent_fid: bigint | null;
    parent_url: string | null;
    text: string;
    embeds: string[];
    mentions: bigint[];
    mentions_positions: number[];
  };
  casts_with_reactions_materialized: {
    id: bigint;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    timestamp: string;
    fid: bigint;
    hash: string;
    parent_hash: string | null;
    parent_fid: bigint | null;
    parent_url: string | null;
    text: string;
    embeds: string[];
    mentions: bigint[];
    mentions_positions: number[];
    likes: number;
    recasts: number;
    comments: number;
    pfp: string | null;
    display: string | null;
    bio: string | null;
    url: string | null;
    fname: string | null;
  };
  reactions: {
    id: bigint;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    timestamp: string;
    fid: bigint;
    reaction_type: number;
    hash: Buffer;
    target_hash: Buffer | null;
    target_fid: bigint | null;
    target_url: string | null;
  };
  verifications: {
    id: bigint;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    timestamp: string;
    fid: bigint;
    hash: Buffer;
    claim: object;
  };
  signers: {
    id: bigint;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    timestamp: string;
    fid: bigint;
    hash: Buffer;
    custody_address: Buffer;
    signer: Buffer;
    name: string;
  };
  user_data: {
    id: bigint;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    timestamp: string;
    fid: bigint;
    hash: Buffer;
    type: UserDataType;
    value: string;
  };
  fids: {
    fid: bigint;
    created_at: string;
    updated_at: string;
    custody_address: Buffer;
  };
  profiles: {
    fid: bigint;
    created_at: string;
    custody_address: Buffer;
    pfp: string | null;
    display: string | null;
    bio: string | null;
    url: string | null;
    fname: string | null;
  };
}