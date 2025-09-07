import {
  FarcasterCast,
  HubCast,
  FarcasterErrorCode,
  FarcasterUserOptions,
  FarcasterCastOptions
} from './types';
import { universalLogger as logger } from '@/app/lib/axiom/universal';

export class FarcasterError extends Error {
  public code: FarcasterErrorCode;
  public details?: any;

  constructor(code: FarcasterErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'FarcasterError';
    this.code = code;
    this.details = details;
  }
}

export class Farcaster {
  private baseUrl: string;
  private timeout: number;

  constructor(options: {
    baseUrl?: string;
    timeout?: number;
  } = {}) {
    this.baseUrl = options.baseUrl || 'https://api.farcaster.xyz';
    this.timeout = options.timeout || 15000;
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>, cacheTime = 3600): Promise<T> {
    const startTime = Date.now();
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    try {
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      logger.info('Farcaster API request', { 
        endpoint, 
        url: url.toString(), 
        params 
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout),
        next: { revalidate: cacheTime }
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        logger.error('Farcaster API error', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          duration
        });

        if (response.status === 404) {
          throw new FarcasterError('NOT_FOUND', `Resource not found: ${endpoint}`);
        }
        if (response.status === 400) {
          throw new FarcasterError('BAD_REQUEST', `Bad request: ${endpoint}`);
        }
        throw new FarcasterError('INTERNAL_ERROR', `HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info('Farcaster API success', {
        endpoint,
        status: response.status,
        duration
      });

      return await response.json();
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof FarcasterError) {
        logger.error('Farcaster API error', {
          endpoint,
          error: error.code,
          message: error.message,
          duration
        });
        throw error;
      }
      if (error instanceof Error && error.name === 'TimeoutError') {
        logger.error('Farcaster API timeout', { endpoint, duration });
        throw new FarcasterError('TIMEOUT', `Request timeout: ${endpoint}`);
      }
      
      logger.error('Farcaster API network error', {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      throw new FarcasterError('NETWORK_ERROR', `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(options: FarcasterUserOptions): Promise<any> {
    return await this.makeRequest('/v2/user', {
      fid: options.fid
    });
  }

  async getCast(options: FarcasterCastOptions): Promise<any> {
    return await this.makeRequest('/v2/thread-casts', {
      castHash: options.hash
    });
  }
}
