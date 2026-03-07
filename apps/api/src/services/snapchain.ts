import { getCached } from "../cache/cached.js";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { getUpstream } from "../upstream-instance.js";
import type {
  SnapchainInfoResponse,
  SnapchainEventResponse,
} from "../upstream/types.js";

export async function getInfo(): Promise<SnapchainInfoResponse> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.snapchainInfo(),
    cacheTTL.snapchainInfo,
    () => up.snapchain.getInfo()
  );
}

export async function getEvent(
  eventId: string,
  shardIndex: string
): Promise<SnapchainEventResponse> {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.snapchainEvent(eventId, shardIndex),
    cacheTTL.snapchainEvent,
    () =>
      up.snapchain.getEventById({
        event_id: eventId,
        shard_index: shardIndex,
      })
  );
}
