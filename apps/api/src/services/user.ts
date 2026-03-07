import { getCached } from "../cache/cached.js";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { getUpstream } from "../upstream-instance.js";
import type { NeynarV2User } from "../upstream/types.js";

export async function getUser(fid: string): Promise<NeynarV2User> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.user(fid),
    cacheTTL.user,
    () => up.neynar.getUser({ fid })
  );
}

export async function getUserByUsername(username: string): Promise<NeynarV2User> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.userByUsername(username),
    cacheTTL.user,
    () => up.neynar.getUserByUsername({ username })
  );
}

export async function getUsersBulk(fids: string[]): Promise<NeynarV2User[]> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  const sorted = [...fids].filter(Boolean).sort();
  if (sorted.length === 0) return [];

  return getCached(
    cacheKeys.usersBulk(sorted),
    cacheTTL.usersBulk,
    () => up.neynar.getUsers({ fids: sorted })
  );
}
