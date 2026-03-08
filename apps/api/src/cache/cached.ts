import { redis } from "./redis.js";
import { coalesce } from "./coalesce.js";

const BIGINT_CACHE_TAG = "__casterscan_bigint__";

function serializeCacheValue(value: unknown): string {
  return JSON.stringify(value, (_key, currentValue) => {
    if (typeof currentValue === "bigint") {
      return { [BIGINT_CACHE_TAG]: currentValue.toString() };
    }

    return currentValue;
  });
}

function deserializeCacheValue<T>(value: string): T {
  return JSON.parse(value, (_key, currentValue: unknown) => {
    if (
      currentValue &&
      typeof currentValue === "object" &&
      !Array.isArray(currentValue) &&
      BIGINT_CACHE_TAG in currentValue &&
      typeof (currentValue as Record<string, unknown>)[BIGINT_CACHE_TAG] === "string"
    ) {
      return BigInt((currentValue as Record<string, string>)[BIGINT_CACHE_TAG]);
    }

    return currentValue;
  }) as T;
}

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // 1. Try cache (skip if Redis unavailable)
  const cached = redis ? await redis.get(key) : null;
  if (cached) {
    try {
      return deserializeCacheValue<T>(cached);
    } catch {
      return fetcher();
    }
  }

  // 2. Coalesce: if same key in flight, wait for it
  return coalesce.get(key, async () => {
    const data = await fetcher();
    if (redis) {
      await redis.setex(key, ttlSeconds, serializeCacheValue(data));
    }
    return data;
  });
}
