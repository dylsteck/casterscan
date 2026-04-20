import { getCached } from "../cache/cached.js";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { getUpstream } from "../upstream-instance.js";
import type { ProfileKeysPage } from "../upstream/types.js";

export async function getKeys(fid: string): Promise<ProfileKeysPage> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.fidKeys(fid),
    cacheTTL.fidKeys,
    async () => {
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

      const authAddresses = pages.flatMap((p) => p.authAddresses);
      const signerKeys = pages.flatMap((p) => p.signerKeys);

      return {
        fid: fidBigInt,
        authAddresses,
        signerKeys,
        page: 0,
        pageSize: authAddresses.length + signerKeys.length,
        hasMore: false,
      };
    }
  );
}
