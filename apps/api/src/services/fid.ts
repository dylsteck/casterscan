import { Effect } from "effect";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { Cache } from "../effect/cache.js";
import { runAppEffect } from "../effect/runtime.js";
import { Upstream } from "../effect/upstream.js";

const STATS_PAGE_SIZE = 1000;

type PaginatedMessagesResponse = {
  messages?: unknown[];
  nextPageToken?: string;
};

async function countPaginatedMessages(
  fetchPage: (pageToken?: string) => Promise<PaginatedMessagesResponse>
): Promise<number> {
  let total = 0;
  let nextPageToken: string | undefined;

  while (true) {
    const page = await fetchPage(nextPageToken);
    total += page.messages?.length ?? 0;

    if (!page.nextPageToken) {
      return total;
    }

    nextPageToken = page.nextPageToken;
  }
}

export function getFidStatsEffect(fid: string): Effect.Effect<
  {
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
  },
  Error,
  Cache | Upstream
> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.fidStats(fid), cacheTTL.fidStats, async () => {
      const [casts, reactions, links, verifications] = await Promise.all([
        countPaginatedMessages((pageToken) =>
          up.snapchain.getCastsByFid({ fid, pageSize: STATS_PAGE_SIZE, pageToken })
        ),
        countPaginatedMessages((pageToken) =>
          up.snapchain.getReactionsByFid({
            fid,
            pageSize: STATS_PAGE_SIZE,
            pageToken,
            reaction_type: "None",
          })
        ),
        countPaginatedMessages((pageToken) =>
          up.snapchain.getLinksByFid({ fid, pageSize: STATS_PAGE_SIZE, pageToken })
        ),
        countPaginatedMessages((pageToken) =>
          up.snapchain.getVerificationsByFid({
            fid,
            pageSize: STATS_PAGE_SIZE,
            pageToken,
          })
        ),
      ]);

      return {
        casts,
        reactions,
        links,
        verifications,
      };
    });
  });
}

export function getFidStats(fid: string) {
  return runAppEffect(getFidStatsEffect(fid));
}

export function getFidMessagesEffect(fid: string): Effect.Effect<
  {
    casts: unknown[];
    reactions: unknown[];
    links: unknown[];
    verifications: unknown[];
  },
  Error,
  Cache | Upstream
> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.fidMessages(fid), cacheTTL.fidMessages, async () => {
      const [casts, reactions, links, verifications] = await Promise.all([
        up.snapchain.getAllCastsByFid(fid),
        up.snapchain.getAllReactionsByFid(fid, "None"),
        up.snapchain.getAllLinksByFid(fid),
        up.snapchain.getAllVerificationsByFid(fid),
      ]);

      return {
        casts,
        reactions,
        links,
        verifications,
      };
    });
  });
}

export function getFidMessages(fid: string) {
  return runAppEffect(getFidMessagesEffect(fid));
}

export function getFidSignersEffect(
  fid: string,
  options?: { pageSize?: number; pageToken?: string; reverse?: boolean; signer?: string }
) {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    const normalizedOptions = {
      pageSize: options?.pageSize ?? 1000,
      pageToken: options?.pageToken,
      reverse: options?.reverse ? true : undefined,
      signer: options?.signer,
    };

    return yield* cache.getCached(cacheKeys.fidSigners(fid, normalizedOptions), cacheTTL.fidSigners, () =>
      up.snapchain.getOnChainSignersByFid({
        fid,
        pageSize: normalizedOptions.pageSize,
        pageToken: normalizedOptions.pageToken,
        reverse: normalizedOptions.reverse,
        signer: normalizedOptions.signer,
      })
    );
  });
}

export function getFidSigners(
  fid: string,
  options?: { pageSize?: number; pageToken?: string; reverse?: boolean; signer?: string }
) {
  return runAppEffect(getFidSignersEffect(fid, options));
}
