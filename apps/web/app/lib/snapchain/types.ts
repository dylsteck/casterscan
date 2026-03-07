export type SnapchainEmbed = {
  url?: string;
  castId?: {
    fid: number;
    hash: string;
  };
};

export type SnapchainCastId = {
  fid: number;
  hash: string;
};

export type SnapchainCastMessage = {
  hash: string;
  data: {
    type: 'MESSAGE_TYPE_CAST_ADD' | 'MESSAGE_TYPE_CAST_REMOVE';
    timestamp: number;
    fid: number;
    network: 'FARCASTER_NETWORK_MAINNET' | 'FARCASTER_NETWORK_TESTNET';
    castAddBody?: {
      text: string;
      embeds: SnapchainEmbed[];
      embedsDeprecated: string[];
      mentions: number[];
      mentionsPositions: number[];
      parentCastId?: SnapchainCastId;
      parentUrl?: string;
      type: 'CAST_TYPE_CAST' | 'CAST_TYPE_LONG_CAST';
    };
    castRemoveBody?: {
      targetHash: string;
    };
  };
  signer: string;
  signature: string;
  signatureScheme: 'SIGNATURE_SCHEME_ED25519' | 'SIGNATURE_SCHEME_EIP712';
  hashScheme: 'HASH_SCHEME_BLAKE3';
};

export type SnapchainReactionMessage = {
  hash: string;
  data: {
    type: 'MESSAGE_TYPE_REACTION_ADD' | 'MESSAGE_TYPE_REACTION_REMOVE';
    timestamp: number;
    fid: number;
    network: 'FARCASTER_NETWORK_MAINNET' | 'FARCASTER_NETWORK_TESTNET';
    reactionBody: {
      type: 'REACTION_TYPE_LIKE' | 'REACTION_TYPE_RECAST' | 'REACTION_TYPE_NONE';
      targetCastId?: SnapchainCastId;
      targetUrl?: string;
    };
  };
  signer: string;
  signature: string;
  signatureScheme: 'SIGNATURE_SCHEME_ED25519' | 'SIGNATURE_SCHEME_EIP712';
  hashScheme: 'HASH_SCHEME_BLAKE3';
};

export type SnapchainLinkMessage = {
  hash: string;
  data: {
    type: 'MESSAGE_TYPE_LINK_ADD' | 'MESSAGE_TYPE_LINK_REMOVE';
    timestamp: number;
    fid: number;
    network: 'FARCASTER_NETWORK_MAINNET' | 'FARCASTER_NETWORK_TESTNET';
    linkBody: {
      type: 'follow' | 'unfollow' | 'LINK_TYPE_FOLLOW' | 'LINK_TYPE_UNFOLLOW';
      targetFid?: number;
      displayTimestamp?: number | null;
    };
  };
  signer: string;
  signature: string;
  signatureScheme: 'SIGNATURE_SCHEME_ED25519' | 'SIGNATURE_SCHEME_EIP712';
  hashScheme: 'HASH_SCHEME_BLAKE3';
};

export type SnapchainVerificationMessage = {
  hash: string;
  data: {
    type: 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS' | 'MESSAGE_TYPE_VERIFICATION_REMOVE';
    timestamp: number;
    fid: number;
    network: 'FARCASTER_NETWORK_MAINNET' | 'FARCASTER_NETWORK_TESTNET';
    verificationAddAddressBody?: {
      address: string;
      claimSignature: string;
      blockHash: string;
      verificationType: number;
      chainId: number;
      protocol: 'PROTOCOL_ETHEREUM' | 'PROTOCOL_SOLANA';
    };
    verificationRemoveBody?: {
      address: string;
    };
  };
  signer: string;
  signature: string;
  signatureScheme: 'SIGNATURE_SCHEME_ED25519' | 'SIGNATURE_SCHEME_EIP712';
  hashScheme: 'HASH_SCHEME_BLAKE3';
};

export type SnapchainUserDataMessage = {
  hash: string;
  data: {
    type: 'MESSAGE_TYPE_USER_DATA_ADD';
    timestamp: number;
    fid: number;
    network: 'FARCASTER_NETWORK_MAINNET' | 'FARCASTER_NETWORK_TESTNET';
    userDataBody: {
      type: 'USER_DATA_TYPE_PFP' | 'USER_DATA_TYPE_DISPLAY' | 'USER_DATA_TYPE_BIO' | 'USER_DATA_TYPE_URL' | 'USER_DATA_TYPE_USERNAME' | 'USER_DATA_TYPE_TWITTER' | 'USER_DATA_PRIMARY_ADDRESS_ETHEREUM' | 'USER_DATA_PRIMARY_ADDRESS_SOLANA';
      value: string;
    };
  };
  signer: string;
  signature: string;
  signatureScheme: 'SIGNATURE_SCHEME_ED25519' | 'SIGNATURE_SCHEME_EIP712';
  hashScheme: 'HASH_SCHEME_BLAKE3';
};

export type SnapchainSignerEventBody = {
  key: string;
  keyType: 'KEY_TYPE_ED25519' | 'KEY_TYPE_SECP256K1';
  eventType: 'SIGNER_EVENT_TYPE_ADD' | 'SIGNER_EVENT_TYPE_REMOVE';
  metadata: string;
  metadataType: 'METADATA_TYPE_NONE' | 'METADATA_TYPE_EIP_712';
};

export type SnapchainIdRegisterEventBody = {
  to: string;
  eventType: 'ID_REGISTER_EVENT_TYPE_REGISTER' | 'ID_REGISTER_EVENT_TYPE_TRANSFER';
  from: string;
};

export type SnapchainStorageRentEventBody = {
  payer: string;
  units: number;
  expiry: number;
};

export type SnapchainOnChainEvent = {
  type: 'EVENT_TYPE_SIGNER' | 'EVENT_TYPE_SIGNER_MIGRATED' | 'EVENT_TYPE_ID_REGISTER' | 'EVENT_TYPE_STORAGE_RENT';
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

export type SnapchainUsernameProof = {
  timestamp: number;
  name: string;
  owner: string;
  signature: string;
  fid: number;
  type: 'USERNAME_TYPE_FNAME' | 'USERNAME_TYPE_ENS_L1';
};

export type SnapchainMessage = SnapchainCastMessage | SnapchainReactionMessage | SnapchainLinkMessage | SnapchainVerificationMessage | SnapchainUserDataMessage;

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

export type SnapchainUserDataResponse = {
  messages: SnapchainUserDataMessage[];
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
  verificationAddAddressBody?: {
    address: string;
    claimSignature: string;
    blockHash: string;
    type: number;
    chainId: number;
    protocol: string;
  };
};

export type SnapchainCastByIdResponse = {
  data: {
    type: 'MESSAGE_TYPE_CAST_ADD';
    fid: number;
    timestamp: number;
    network: 'FARCASTER_NETWORK_MAINNET' | 'FARCASTER_NETWORK_TESTNET';
    castAddBody: {
      embeds: SnapchainEmbed[];
      embedsDeprecated: string[];
      mentions: number[];
      mentionsPositions: number[];
      parentCastId?: SnapchainCastId;
      parentUrl?: string;
      text: string;
      type: 'CAST_TYPE_CAST' | 'CAST_TYPE_LONG_CAST';
    };
  };
  hash: string;
  hashScheme: 'HASH_SCHEME_BLAKE3';
  signature: string;
  signatureScheme: 'SIGNATURE_SCHEME_ED25519' | 'SIGNATURE_SCHEME_EIP712';
  signer: string;
};

export type SnapchainPaginationOptions = {
  pageSize?: number;
  pageToken?: string;
  reverse?: boolean;
};

export type SnapchainCastsByFidOptions = SnapchainPaginationOptions & {
  fid: string;
};

export type SnapchainReactionsByFidOptions = SnapchainPaginationOptions & {
  fid: string;
  reaction_type?: 'REACTION_TYPE_LIKE' | 'REACTION_TYPE_RECAST' | 'REACTION_TYPE_NONE' | 'None';
};

export type SnapchainLinksByFidOptions = SnapchainPaginationOptions & {
  fid: string;
};

export type SnapchainVerificationsByFidOptions = SnapchainPaginationOptions & {
  fid: string;
};

export type SnapchainOnChainSignersByFidOptions = SnapchainPaginationOptions & {
  fid: string;
  signer?: string;
};

export type SnapchainCastByIdOptions = {
  fid: string;
  hash: string;
};

export type SnapchainEventByIdOptions = {
  event_id: string;
  shard_index: string;
};

export type SnapchainHubEvent = {
  type: 'HUB_EVENT_TYPE_MERGE_MESSAGE' | 'HUB_EVENT_TYPE_PRUNE_MESSAGE' | 'HUB_EVENT_TYPE_REVOKE_MESSAGE' | 'HUB_EVENT_TYPE_MERGE_ON_CHAIN_EVENT' | 'HUB_EVENT_TYPE_MERGE_USERNAME_PROOF' | 'HUB_EVENT_TYPE_MERGE_FAILURE' | 'HUB_EVENT_TYPE_BLOCK_CONFIRMED';
  id: number;
  blockNumber: number;
  shardIndex: number;
  mergeMessageBody?: {
    message: SnapchainMessage;
    deletedMessages: SnapchainMessage[];
  };
  pruneMessageBody?: {
    message: SnapchainMessage;
  };
  revokeMessageBody?: {
    message: SnapchainMessage;
  };
  mergeOnChainEventBody?: {
    onChainEvent: SnapchainOnChainEvent;
  };
  mergeUsernameProofBody?: {
    usernameProof: SnapchainUsernameProof;
  };
  blockConfirmedBody?: {
    blockNumber: number;
    shardIndex: number;
    timestamp: number;
    blockHash: string;
    totalEvents: number;
  };
  mergeFailureBody?: {
    error: string;
  };
};

export type SnapchainEventsResponse = {
  events: SnapchainHubEvent[];
  nextPageToken?: string;
};

export type SnapchainErrorCode = 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT';
