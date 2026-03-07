export const cacheKeys = {
  user: (fid: string) => `user:${fid}`,
  userByUsername: (username: string) =>
    `user:username:${username.toLowerCase()}`,
  usersBulk: (fids: string[]) => `users:bulk:${[...fids].sort().join(",")}`,
  cast: (hash: string, format?: string) =>
    format ? `cast:${hash}:${format}` : `cast:${hash}`,
  fidMessages: (fid: string) => `fid:${fid}:messages`,
  fidStats: (fid: string) => `fid:${fid}:stats`,
  fidSigners: (fid: string) => `fid:${fid}:signers`,
  fidSignersEnriched: (fid: string) => `fid:${fid}:signers:enriched`,
  fidSignerMessages: (fid: string, signer: string) =>
    `fid:${fid}:signers:${signer}:messages`,
  fidSignerStats: (fid: string, signer: string) =>
    `fid:${fid}:signers:${signer}:stats`,
  fidKeys: (fid: string) => `fid:${fid}:keys`,
  snapchainInfo: () => "snapchain:info",
  snapchainEvent: (eventId: string, shardIndex: string) =>
    `snapchain:event:${eventId}:${shardIndex}`,
} as const;

export const cacheTTL = {
  fidStats: 900,
  fidMessages: 900,
  fidSigners: 3600,
  fidSignersEnriched: 900,
  fidSignerMessages: 900,
  fidSignerStats: 900,
  fidKeys: 3600,
  user: 3600,
  usersBulk: 3600,
  cast: 3600,
  snapchainInfo: 300,
  snapchainEvent: 900,
} as const;
