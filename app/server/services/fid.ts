import { getCached } from "../cache/cached.js";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { getUpstream } from "../upstream-instance.js";

export async function getFidStats(fid: string) {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.fidStats(fid),
    cacheTTL.fidStats,
    async () => {
      const [castsRes, reactionsRes, linksRes, verificationsRes] =
        await Promise.all([
          up.snapchain.getCastsByFid({ fid, pageSize: 1000 }),
          up.snapchain.getReactionsByFid({ fid, pageSize: 1000, reaction_type: "None" }),
          up.snapchain.getLinksByFid({ fid, pageSize: 1000 }),
          up.snapchain.getVerificationsByFid({ fid, pageSize: 1000 }),
        ]);

      return {
        casts: castsRes.messages?.length ?? 0,
        reactions: reactionsRes.messages?.length ?? 0,
        links: linksRes.messages?.length ?? 0,
        verifications: verificationsRes.messages?.length ?? 0,
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

  return getCached(
    cacheKeys.fidSigners(fid),
    cacheTTL.fidSigners,
    () =>
      up.snapchain.getOnChainSignersByFid({
        fid,
        pageSize: options?.pageSize ?? 1000,
        pageToken: options?.pageToken,
        reverse: options?.reverse,
        signer: options?.signer,
      })
  );
}
