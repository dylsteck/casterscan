import client from './redis';

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function cacheData(key: string, data: any, expirySeconds = 3600) {
  const redis = await connectRedis();
  await redis.set(key, JSON.stringify(data), { EX: expirySeconds });
  return data;
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const redis = await connectRedis();
  const data = await redis.get(key);
  return data ? JSON.parse(data) as T : null;
}

export async function invalidateCache(key: string) {
  const redis = await connectRedis();
  await redis.del(key);
} 