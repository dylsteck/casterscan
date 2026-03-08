import Redis from "ioredis";
import { Context, Effect, Layer } from "effect";
import { AppConfig, AppConfigLive } from "./config.js";

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

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function createCoalescer() {
  const inFlight = new Map<string, Promise<unknown>>();

  return {
    get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
      const existing = inFlight.get(key);
      if (existing) {
        return existing as Promise<T>;
      }

      const promise = fetcher().finally(() => {
        inFlight.delete(key);
      });

      inFlight.set(key, promise);
      return promise as Promise<T>;
    },
  };
}

export type CacheService = {
  getCached: <T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
  ) => Effect.Effect<T, Error>;
};

export class Cache extends Context.Tag("@casterscan/api/Cache")<Cache, CacheService>() {}

export const CacheLive = Layer.effect(
  Cache,
  Effect.gen(function* () {
    const { REDIS_URL } = yield* AppConfig;
    const redis = REDIS_URL ? new Redis(REDIS_URL) : null;
    const coalescer = createCoalescer();

    if (!redis) {
      console.warn("REDIS_URL not set — cache disabled");
    } else {
      redis.on("error", (error: Error) => console.error("Redis error:", error));
      redis.on("connect", () => console.log("Redis connected"));
    }

    return {
      getCached: <T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>) =>
        Effect.gen(function* () {
          const cached = redis
            ? yield* Effect.tryPromise({
                try: () => redis.get(key),
                catch: toError,
              })
            : null;

          if (cached) {
            try {
              return deserializeCacheValue<T>(cached);
            } catch {
              return yield* Effect.tryPromise({
                try: fetcher,
                catch: toError,
              });
            }
          }

          return yield* Effect.tryPromise({
            try: () =>
              coalescer.get(key, async () => {
                const data = await fetcher();

                if (redis) {
                  await redis.setex(key, ttlSeconds, serializeCacheValue(data));
                }

                return data;
              }),
            catch: toError,
          });
        }),
    } satisfies CacheService;
  })
).pipe(Layer.provide(AppConfigLive));
