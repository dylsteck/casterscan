import Redis from "ioredis";

export let redis: Redis | null = null;

export async function initRedis(url?: string): Promise<void> {
  if (!url) {
    console.warn("REDIS_URL not set — cache disabled");
    return;
  }
  redis = new Redis(url);
  redis.on("error", (err: Error) => console.error("Redis error:", err));
  redis.on("connect", () => console.log("Redis connected"));
}
