import { Effect } from "effect";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { Cache } from "../effect/cache.js";
import { runAppEffect } from "../effect/runtime.js";
import { Upstream } from "../effect/upstream.js";
import type {
  NeynarV2Cast,
  NeynarHubCast,
  SnapchainCastByIdResponse,
} from "../upstream/types.js";

export type CastFormat = "neynar-hub" | "farcaster-hub" | "farcaster-api";

export function getCastEffect(hash: string): Effect.Effect<NeynarV2Cast, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.cast(hash), cacheTTL.cast, () =>
      up.neynar.getCast({
        identifier: hash,
        type: "hash",
      })
    );
  });
}

export function getCast(hash: string): Promise<NeynarV2Cast> {
  return runAppEffect(getCastEffect(hash));
}

export function getCastFormatEffect(
  fid: string,
  hash: string,
  format: CastFormat
): Effect.Effect<NeynarHubCast | SnapchainCastByIdResponse | unknown, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.cast(hash, format), cacheTTL.cast, async () => {
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
    });
  });
}

export function getCastFormat(
  fid: string,
  hash: string,
  format: CastFormat
): Promise<NeynarHubCast | SnapchainCastByIdResponse | unknown> {
  return runAppEffect(getCastFormatEffect(fid, hash, format));
}
