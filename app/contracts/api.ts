import { z } from "zod";

export const fidSchema = z.string().regex(/^\d+$/, "fid must be numeric");
export const hashSchema = z.string().regex(/^0x[a-fA-F0-9]+$/, "hash must be 0x-prefixed hex");
export const eventIdSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/, "eventId contains invalid chars");
export const usernameSchema = z.string().max(50).regex(/^[a-zA-Z0-9_.-]+$/, "username contains invalid chars");
export const signerKeySchema = z.string().max(200).regex(/^[a-zA-Z0-9+/=_-]+$/, "signerKey contains invalid chars");

export const castFormatSchema = z.enum(["neynar-hub", "farcaster-hub", "farcaster-api"]);

export const fidStatsResponseSchema = z.object({
  casts: z.number(),
  reactions: z.number(),
  links: z.number(),
  verifications: z.number(),
});

export const signerStatsResponseSchema = z.object({
  casts: z.number(),
  reactions: z.number(),
  links: z.number(),
  verifications: z.number(),
  total: z.number(),
  lastUsed: z.string().nullable(),
});

export const infoResponseSchema = z.object({
  dbStats: z.object({
    numMessages: z.number(),
    numFidRegistrations: z.number(),
    approxSize: z.number(),
  }),
  numShards: z.number(),
  shardInfos: z.array(
    z.object({
      shardId: z.number(),
      maxHeight: z.number(),
      numMessages: z.number(),
      numFidRegistrations: z.number(),
      approxSize: z.number(),
      blockDelay: z.number(),
      mempoolSize: z.number(),
    })
  ),
  version: z.string(),
  peer_id: z.string(),
  nextEngineVersionTimestamp: z.number(),
});

export const eventRouteQuerySchema = z.object({
  event_id: eventIdSchema,
  shard_index: z.string().optional(),
});

export const signerMessagesQuerySchema = z.object({
  fid: fidSchema,
  signer: signerKeySchema,
});

export const signerStatsQuerySchema = signerMessagesQuerySchema;
export const userQuerySchema = z.object({ fid: fidSchema });
export const castQuerySchema = z.object({ hash: hashSchema });

export const snapchainCastQuerySchema = z.object({
  fid: fidSchema,
  hash: hashSchema,
  type: z.enum(["neynar", "farcaster"]),
});

export const neynarCastQuerySchema = z.object({
  identifier: z.string().min(1),
  type: z.enum(["url", "hash"]),
});

export const farcasterFidQuerySchema = z.object({
  pageSize: z.string().optional(),
  pageToken: z.string().optional(),
  reverse: z.string().optional(),
  signer: z.string().optional(),
});

export const genericArrayResponseSchema = z.array(z.record(z.string(), z.unknown()));
export const genericObjectResponseSchema = z.record(z.string(), z.unknown());
export const neynarUserResponseSchema = z.object({
  fid: z.number(),
  username: z.string(),
  display_name: z.string().optional(),
  pfp_url: z.string().optional(),
}).passthrough();

export const neynarCastResponseSchema = z.object({
  hash: z.string(),
  text: z.string(),
  timestamp: z.string(),
  author: z.object({
    fid: z.number(),
    username: z.string(),
    display_name: z.string(),
    pfp_url: z.string().optional(),
  }).passthrough(),
  app: z.object({
    fid: z.number(),
    username: z.string().optional(),
    display_name: z.string().optional(),
    pfp_url: z.string().optional(),
  }).passthrough(),
  reactions: z.object({
    likes_count: z.number(),
    recasts_count: z.number(),
  }).passthrough(),
  replies: z.object({
    count: z.number(),
  }).passthrough(),
  embeds: z.array(z.object({ url: z.string().optional() }).passthrough()),
  thread_hash: z.string(),
}).passthrough();

export const keysResponseSchema = z.object({
  fid: z.string(),
  authAddresses: z.array(z.string()),
  signerKeys: z.array(z.string()),
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean(),
});

export type InfoResponse = z.infer<typeof infoResponseSchema>;
export type FidStatsResponse = z.infer<typeof fidStatsResponseSchema>;
export type SignerStatsResponse = z.infer<typeof signerStatsResponseSchema>;
export type NeynarUserResponse = z.infer<typeof neynarUserResponseSchema>;
export type NeynarCastResponse = z.infer<typeof neynarCastResponseSchema>;
export type KeysResponse = z.infer<typeof keysResponseSchema>;
