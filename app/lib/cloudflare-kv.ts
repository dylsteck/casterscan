import { Cloudflare } from 'cloudflare';

const client = new Cloudflare({
  apiToken: process.env.CF_API_TOKEN
});

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '';
const KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || '';

const memoryCache = new Map<string, { data: any; expiry: number }>();

export async function cacheData(key: string, data: any, expirySeconds = 3600, userId?: string | number) {
  try {
    const cacheKey = userId ? `${key}:${userId}` : key;
    
    if (KV_NAMESPACE_ID && ACCOUNT_ID && process.env.CF_API_TOKEN) {
      const expiration = Math.floor(Date.now() / 1000) + expirySeconds;
      
      await client.kv.namespaces.values.update(KV_NAMESPACE_ID, cacheKey, {
        account_id: ACCOUNT_ID,
        value: JSON.stringify(data),
        expiration_ttl: expirySeconds,
        metadata: JSON.stringify({ timestamp: Date.now() })
      });
    } else {
      memoryCache.set(cacheKey, {
        data,
        expiry: Date.now() + expirySeconds * 1000
      });
    }
    
    return data;
  } catch (error) {
    console.error('KV Cache Error (cacheData):', error);
    
    const cacheKey = userId ? `${key}:${userId}` : key;
    memoryCache.set(cacheKey, {
      data,
      expiry: Date.now() + expirySeconds * 1000
    });
    
    return data;
  }
}

export async function getCachedData<T>(key: string, userId?: string | number): Promise<T | null> {
  try {
    const cacheKey = userId ? `${key}:${userId}` : key;
    
    if (memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T;
      } else if (cached) {
        memoryCache.delete(cacheKey);
      }
    }
    
    if (!KV_NAMESPACE_ID || !ACCOUNT_ID || !process.env.CF_API_TOKEN) {
      return null;
    }
    
    const response = await client.kv.namespaces.values.get(KV_NAMESPACE_ID, cacheKey, {
      account_id: ACCOUNT_ID
    });
    
    if (!response) {
      return null;
    }
    
    try {
      let responseText = '';
      
      if (typeof response === 'string') {
        responseText = response;
      } else if (response instanceof Response) {
        responseText = await response.text();
      } else if (typeof response === 'object') {
        responseText = JSON.stringify(response);
      } else {
        console.error('KV Parse Error: Unknown response type:', typeof response);
        return null;
      }
      
      const parsedData = JSON.parse(responseText) as T;
      
      memoryCache.set(cacheKey, {
        data: parsedData,
        expiry: Date.now() + 3600 * 1000
      });
      
      return parsedData;
    } catch (parseError) {
      console.error('KV Parse Error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('KV Cache Error (getCachedData):', error);
    
    const cacheKey = userId ? `${key}:${userId}` : key;
    if (memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T;
      }
    }
    
    return null;
  }
}

export async function invalidateCache(key: string, userId?: string | number) {
  try {
    const cacheKey = userId ? `${key}:${userId}` : key;
    memoryCache.delete(cacheKey);
    
    if (KV_NAMESPACE_ID && ACCOUNT_ID && process.env.CF_API_TOKEN) {
      await client.kv.namespaces.values.delete(KV_NAMESPACE_ID, cacheKey, {
        account_id: ACCOUNT_ID
      });
    }
  } catch (error) {
    console.error('KV Cache Error (invalidateCache):', error);
  }
} 