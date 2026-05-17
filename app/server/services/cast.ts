import { getCached } from "../cache/cached.js";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { getUpstream } from "../upstream-instance.js";
import type {
  HypersnapV2Cast,
  HypersnapHubCast,
  SnapchainCastByIdResponse,
} from "../upstream/types.js";

export type CastFormat = "hypersnap-hub" | "farcaster-hub" | "farcaster-api";

export async function getCast(hash: string): Promise<HypersnapV2Cast> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.cast(hash),
    cacheTTL.cast,
    () =>
      up.hypersnap.getCast({
        identifier: hash,
        type: "hash",
      })
  );
}

export async function getCastFormat(
  fid: string,
  hash: string,
  format: CastFormat
): Promise<HypersnapHubCast | SnapchainCastByIdResponse | unknown> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.cast(hash, format),
    cacheTTL.cast,
    async () => {
      switch (format) {
        case "hypersnap-hub":
          return up.hypersnap.getCastById({ fid, hash });
        case "farcaster-hub":
          return up.snapchain.getCastById({ fid, hash });
        case "farcaster-api":
          return up.farcaster.getCast({ hash });
        default:
          throw new Error(`Unknown cast format: ${format}`);
      }
    }
  );
}
