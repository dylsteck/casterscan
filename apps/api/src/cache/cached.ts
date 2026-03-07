import { redis } from "./redis.js";
import { coalesce } from "./coalesce.js";

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // 1. Try cache (skip if Redis unavailable)
  const cached = redis ? await redis.get(key) : null;
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      return fetcher();
    }
  }

  // 2. Coalesce: if same key in flight, wait for it
  return coalesce.get(key, async () => {
    const data = await fetcher();
    if (redis) await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  });
}
