import { getCached } from "../cache/cached";
import { cacheKeys, cacheTTL } from "../cache/keys";
import { getUpstream } from "../upstream-instance";
import type {
  NeynarV2Cast,
  NeynarHubCast,
  SnapchainCastByIdResponse,
} from "../upstream/types";

export type CastFormat = "neynar-hub" | "farcaster-hub" | "farcaster-api";

export async function getCast(hash: string): Promise<NeynarV2Cast> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.cast(hash),
    cacheTTL.cast,
    () =>
      up.neynar.getCast({
        identifier: hash,
        type: "hash",
      })
  );
}

export async function getCastFormat(
  fid: string,
  hash: string,
  format: CastFormat
): Promise<NeynarHubCast | SnapchainCastByIdResponse | unknown> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.cast(hash, format),
    cacheTTL.cast,
    async () => {
      switch (format) {
        case "neynar-hub":
          return up.neynar.getCastById({ fid, hash });
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
