import { getCached } from "../cache/cached";
import { cacheKeys, cacheTTL } from "../cache/keys";
import { getUpstream } from "../upstream-instance";

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
