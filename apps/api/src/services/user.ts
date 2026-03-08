import { Effect } from "effect";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { Cache } from "../effect/cache.js";
import { runAppEffect } from "../effect/runtime.js";
import { Upstream } from "../effect/upstream.js";
import type { NeynarV2User } from "../upstream/types.js";

export function getUserEffect(fid: string): Effect.Effect<NeynarV2User, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.user(fid), cacheTTL.user, () =>
      up.neynar.getUser({ fid })
    );
  });
}

export function getUser(fid: string): Promise<NeynarV2User> {
  return runAppEffect(getUserEffect(fid));
}

export function getUserByUsernameEffect(
  username: string
): Effect.Effect<NeynarV2User, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.userByUsername(username), cacheTTL.user, () =>
      up.neynar.getUserByUsername({ username })
    );
  });
}

export function getUserByUsername(username: string): Promise<NeynarV2User> {
  return runAppEffect(getUserByUsernameEffect(username));
}

export function getUsersBulkEffect(
  fids: string[]
): Effect.Effect<NeynarV2User[], Error, Cache | Upstream> {
  const sorted = [...fids].filter(Boolean).sort();
  if (sorted.length === 0) {
    return Effect.succeed([]);
  }

  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.usersBulk(sorted), cacheTTL.usersBulk, () =>
      up.neynar.getUsers({ fids: sorted })
    );
  });
}

export function getUsersBulk(fids: string[]): Promise<NeynarV2User[]> {
  return runAppEffect(getUsersBulkEffect(fids));
}
