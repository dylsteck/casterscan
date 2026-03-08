function sanitizeKeyPart(s: string): string {
  return s.replace(/[\r\n:]/g, "");
}

type FidSignersCacheOptions = {
  pageSize?: number;
  pageToken?: string;
  reverse?: boolean;
  signer?: string;
};

export const cacheKeys = {
  user: (fid: string) => `user:${sanitizeKeyPart(fid)}`,
  userByUsername: (username: string) =>
    `user:username:${sanitizeKeyPart(username.toLowerCase())}`,
  usersBulk: (fids: string[]) =>
    `users:bulk:${[...fids].map(sanitizeKeyPart).sort().join(",")}`,
  cast: (hash: string, format?: string) =>
    format ? `cast:${sanitizeKeyPart(hash)}:${format}` : `cast:${sanitizeKeyPart(hash)}`,
  fidMessages: (fid: string) => `fid:${sanitizeKeyPart(fid)}:messages`,
  fidStats: (fid: string) => `fid:${sanitizeKeyPart(fid)}:stats`,
  fidSigners: (fid: string, options?: FidSignersCacheOptions) => {
    const normalizedPageSize = options?.pageSize ?? 1000;
    const queryParts = [
      `pageSize=${normalizedPageSize}`,
      options?.pageToken ? `pageToken=${options.pageToken}` : null,
      options?.reverse ? "reverse=true" : null,
      options?.signer ? `signer=${options.signer}` : null,
    ].filter(Boolean) as string[];

    return `fid:${sanitizeKeyPart(fid)}:signers:${queryParts.map(sanitizeKeyPart).join(":")}`;
  },
  fidSignersEnriched: (fid: string) => `fid:${sanitizeKeyPart(fid)}:signers:enriched`,
  fidSignerMessages: (fid: string, signer: string) =>
    `fid:${sanitizeKeyPart(fid)}:signers:${sanitizeKeyPart(signer)}:messages`,
  fidSignerStats: (fid: string, signer: string) =>
    `fid:${sanitizeKeyPart(fid)}:signers:${sanitizeKeyPart(signer)}:stats`,
  fidKeys: (fid: string) => `fid:${sanitizeKeyPart(fid)}:keys`,
  snapchainInfo: () => "snapchain:info",
  snapchainEvent: (eventId: string, shardIndex: string) =>
    `snapchain:event:${sanitizeKeyPart(eventId)}:${sanitizeKeyPart(shardIndex)}`,
} as const;

export const cacheTTL = {
  fidStats: 900,
  fidMessages: 900,
  fidSigners: 3600,
  fidSignersEnriched: 3600,
  fidSignerMessages: 900,
  fidSignerStats: 900,
  fidKeys: 3600,
  user: 3600,
  usersBulk: 3600,
  cast: 3600,
  snapchainInfo: 300,
  snapchainEvent: 900,
} as const;
