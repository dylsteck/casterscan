import { Effect } from "effect";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { Cache } from "../effect/cache.js";
import { runAppEffect } from "../effect/runtime.js";
import { Upstream } from "../effect/upstream.js";
import type {
  SnapchainInfoResponse,
  SnapchainEventResponse,
} from "../upstream/types.js";

export function getInfoEffect(): Effect.Effect<SnapchainInfoResponse, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(cacheKeys.snapchainInfo(), cacheTTL.snapchainInfo, () =>
      up.snapchain.getInfo()
    );
  });
}

export function getInfo(): Promise<SnapchainInfoResponse> {
  return runAppEffect(getInfoEffect());
}

export function getEventEffect(
  eventId: string,
  shardIndex: string
): Effect.Effect<SnapchainEventResponse, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(
      cacheKeys.snapchainEvent(eventId, shardIndex),
      cacheTTL.snapchainEvent,
      () =>
        up.snapchain.getEventById({
          event_id: eventId,
          shard_index: shardIndex,
        })
    );
  });
}

export function getEvent(eventId: string, shardIndex: string): Promise<SnapchainEventResponse> {
  return runAppEffect(getEventEffect(eventId, shardIndex));
}
