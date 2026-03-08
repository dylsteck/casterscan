import { Effect } from "effect";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { Cache } from "../effect/cache.js";
import { runAppEffect } from "../effect/runtime.js";
import { Upstream } from "../effect/upstream.js";
import type { ProfileKeysPage } from "../upstream/types.js";

export function getKeysEffect(fid: string): Effect.Effect<ProfileKeysPage, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.fidKeys(fid), cacheTTL.fidKeys, async () => {
      const fidBigInt = BigInt(fid);
      const pages: ProfileKeysPage[] = [];
      let page = 0;
      const pageSize = 250;

      while (true) {
        const result = await up.fetchKeysForFid(fidBigInt, page, pageSize);
        pages.push(result);
        if (!result.hasMore) break;
        page++;
      }

      const authAddresses = pages.flatMap((pageResult) => pageResult.authAddresses);
      const signerKeys = pages.flatMap((pageResult) => pageResult.signerKeys);

      return {
        fid: fidBigInt,
        authAddresses,
        signerKeys,
        page: 0,
        pageSize: authAddresses.length + signerKeys.length,
        hasMore: false,
      };
    });
  });
}

export function getKeys(fid: string): Promise<ProfileKeysPage> {
  return runAppEffect(getKeysEffect(fid));
}
