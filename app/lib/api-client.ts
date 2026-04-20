import {
  eventRouteQuerySchema,
  farcasterFidQuerySchema,
  fidStatsResponseSchema,
  infoResponseSchema,
  keysResponseSchema,
  neynarCastQuerySchema,
  neynarCastResponseSchema,
  neynarUserResponseSchema,
  signerMessagesQuerySchema,
  signerStatsQuerySchema,
  signerStatsResponseSchema,
  snapchainCastQuerySchema,
} from "@/app/contracts/api";

async function fetchApi<T>(path: string, schema: { parse: (value: unknown) => T }): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

export const apiClient = {
  getSnapchainInfo: () => fetchApi("/api/snapchain/info", infoResponseSchema),
  getFidStats: (fid: string) => fetchApi(`/api/fid/${fid}/stats`, fidStatsResponseSchema),
  getSignerMessages: (fid: string, signer: string) => {
    const q = signerMessagesQuerySchema.parse({ fid, signer });
    return fetchApi(`/api/signers/messages?fid=${encodeURIComponent(q.fid)}&signer=${encodeURIComponent(q.signer)}`, {
      parse: (v) => v as unknown[],
    });
  },
  getSignerStats: (fid: string, signer: string) => {
    const q = signerStatsQuerySchema.parse({ fid, signer });
    return fetchApi(`/api/signers/stats?fid=${encodeURIComponent(q.fid)}&signer=${encodeURIComponent(q.signer)}`, signerStatsResponseSchema);
  },
  getSignersEnriched: (fid: string) => fetchApi(`/api/signers/enriched?fid=${fid}`, { parse: (v) => v as unknown[] }),
  getFarcasterCast: (hash: string) => fetchApi(`/api/farcaster/cast?hash=${hash}`, { parse: (v) => v as unknown }),
  getSnapchainCast: (fid: string, hash: string, type: "neynar" | "farcaster") => {
    const q = snapchainCastQuerySchema.parse({ fid, hash, type });
    return fetchApi(`/api/snapchain/cast?fid=${q.fid}&hash=${q.hash}&type=${q.type}`, { parse: (v) => v as unknown });
  },
  getNeynarUser: (fid: string) => fetchApi(`/api/neynar/user?fid=${fid}`, { parse: (v) => ({ users: [neynarUserResponseSchema.parse((v as { users: unknown[] }).users?.[0])] }) }),
  getNeynarCast: (identifier: string, type: "url" | "hash") => {
    const q = neynarCastQuerySchema.parse({ identifier, type });
    return fetchApi(`/api/neynar/cast?identifier=${encodeURIComponent(q.identifier)}&type=${q.type}`, {
      parse: (v) => ({ cast: neynarCastResponseSchema.parse((v as { cast: unknown }).cast) }),
    });
  },
  getFidKeys: (fid: string) => fetchApi(`/api/farcaster/${fid}/keys`, keysResponseSchema),
  getFidSigners: (fid: string, query: { pageSize?: string; pageToken?: string; reverse?: string; signer?: string }) => {
    const parsed = farcasterFidQuerySchema.parse(query);
    const search = new URLSearchParams();
    if (parsed.pageSize) search.set("pageSize", parsed.pageSize);
    if (parsed.pageToken) search.set("pageToken", parsed.pageToken);
    if (parsed.reverse) search.set("reverse", parsed.reverse);
    if (parsed.signer) search.set("signer", parsed.signer);
    const qs = search.toString();
    return fetchApi(`/api/farcaster/${fid}/signers${qs ? `?${qs}` : ""}`, { parse: (v) => v as unknown });
  },
  getSnapchainEvent: (eventId: string, shardIndex?: string) => {
    const q = eventRouteQuerySchema.parse({ event_id: eventId, shard_index: shardIndex });
    const search = new URLSearchParams({ event_id: q.event_id, shard_index: q.shard_index ?? "0" });
    return fetchApi(`/api/snapchain/event?${search.toString()}`, { parse: (v) => v as unknown });
  },
};
