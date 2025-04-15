import { Cloudflare } from 'cloudflare';

const client = new Cloudflare({
  apiToken: process.env.CF_API_TOKEN
});

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '';
const KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || '';
// Cloudflare KV minimum TTL is 60 seconds
const MIN_TTL = 60;

const memoryCache = new Map<string, { data: any; expiry: number }>();

export async function cacheData(key: string, data: any, expirySeconds = 3600, userId?: string | number) {
  try {
    const cacheKey = userId ? `${key}:${userId}` : key;
    
    // Ensure TTL is at least 60 seconds
    const ttl = Math.max(expirySeconds, MIN_TTL);
    
    const valueToStore = {
      value: data
    };
    
    if (KV_NAMESPACE_ID && ACCOUNT_ID && process.env.CF_API_TOKEN) {
      const expiration = Math.floor(Date.now() / 1000) + ttl;
      
      await client.kv.namespaces.values.update(KV_NAMESPACE_ID, cacheKey, {
        account_id: ACCOUNT_ID,
        value: JSON.stringify(valueToStore),
        expiration_ttl: ttl,
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
    
    try {
      const response = await client.kv.namespaces.values.get(KV_NAMESPACE_ID, cacheKey, {
        account_id: ACCOUNT_ID
      });
      
      if (!response) {
        return null;
      }
      
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
      
      try {
        const parsedData = JSON.parse(responseText);
        
        const actualData = parsedData.value !== undefined ? parsedData.value : parsedData;
        
        memoryCache.set(cacheKey, {
          data: actualData,
          expiry: Date.now() + 3600 * 1000
        });
        
        return actualData as T;
      } catch (parseError) {
        console.error('KV Parse Error:', parseError);
        return null;
      }
    } catch (error: any) {
 
      if (!(error?.errors?.[0]?.message?.includes('key not found'))) {
        console.error('KV Cache Error (getCachedData):', error);
      }
      return null;
    }
  } catch (error) {
    if (error instanceof Error && 
        !(error.message?.includes('key not found'))) {
      console.error('KV Cache Error (getCachedData):', error);
    }
    
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