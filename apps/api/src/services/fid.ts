import { getCached } from "../cache/cached.js";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { getUpstream } from "../upstream-instance.js";

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

export async function getFidStats(fid: string) {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.fidStats(fid),
    cacheTTL.fidStats,
    async () => {
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
    }
  );
}

export async function getFidMessages(fid: string) {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.fidMessages(fid),
    cacheTTL.fidMessages,
    async () => {
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
    }
  );
}

export async function getFidSigners(fid: string, options?: { pageSize?: number; pageToken?: string; reverse?: boolean; signer?: string }) {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  const normalizedOptions = {
    pageSize: options?.pageSize ?? 1000,
    pageToken: options?.pageToken,
    reverse: options?.reverse ? true : undefined,
    signer: options?.signer,
  };

  return getCached(
    cacheKeys.fidSigners(fid, normalizedOptions),
    cacheTTL.fidSigners,
    () =>
      up.snapchain.getOnChainSignersByFid({
        fid,
        pageSize: normalizedOptions.pageSize,
        pageToken: normalizedOptions.pageToken,
        reverse: normalizedOptions.reverse,
        signer: normalizedOptions.signer,
      })
  );
}
