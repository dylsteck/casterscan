import {
  FarcasterCast,
  HubCast,
  FarcasterErrorCode,
  FarcasterUserOptions,
  FarcasterCastOptions
} from './types';

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

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new FarcasterError('NOT_FOUND', `Resource not found: ${endpoint}`);
        }
        if (response.status === 400) {
          throw new FarcasterError('BAD_REQUEST', `Bad request: ${endpoint}`);
        }
        throw new FarcasterError('INTERNAL_ERROR', `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof FarcasterError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new FarcasterError('TIMEOUT', `Request timeout: ${endpoint}`);
      }
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
