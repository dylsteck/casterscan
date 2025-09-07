import {
  NeynarV2Cast,
  NeynarV2User,
  NeynarHubCast,
  NeynarErrorCode,
  NeynarCastOptions,
  NeynarUserOptions,
  NeynarUserByUsernameOptions,
  NeynarCastByIdOptions
} from './types';

export class NeynarError extends Error {
  public code: NeynarErrorCode;
  public details?: any;

  constructor(code: NeynarErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'NeynarError';
    this.code = code;
    this.details = details;
  }
}

export class Neynar {
  private baseUrl: string;
  private hubUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(options: {
    baseUrl?: string;
    hubUrl?: string;
    apiKey?: string;
    timeout?: number;
  } = {}) {
    this.baseUrl = options.baseUrl || 'https://api.neynar.com';
    this.hubUrl = options.hubUrl || 'https://snapchain-api.neynar.com';
    this.apiKey = options.apiKey || process.env.NEYNAR_API_KEY || '';
    this.timeout = options.timeout || 15000;
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>, useHubUrl = false, cacheTime = 3600): Promise<T> {
    try {
      const baseUrl = useHubUrl ? this.hubUrl : this.baseUrl;
      const url = new URL(`${baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout),
        next: { revalidate: cacheTime }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NeynarError('NOT_FOUND', `Resource not found: ${endpoint}`);
        }
        if (response.status === 400) {
          throw new NeynarError('BAD_REQUEST', `Bad request: ${endpoint}`);
        }
        if (response.status === 401) {
          throw new NeynarError('UNAUTHORIZED', `Unauthorized: ${endpoint}`);
        }
        throw new NeynarError('INTERNAL_ERROR', `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof NeynarError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new NeynarError('TIMEOUT', `Request timeout: ${endpoint}`);
      }
      throw new NeynarError('NETWORK_ERROR', `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCast(options: NeynarCastOptions): Promise<NeynarV2Cast> {
    const response = await this.makeRequest<{ cast: NeynarV2Cast }>('/v2/farcaster/cast', {
      identifier: options.identifier,
      type: options.type
    });
    return response.cast;
  }

  async getUser(options: NeynarUserOptions): Promise<NeynarV2User> {
    const response = await this.makeRequest<{ users: NeynarV2User[] }>('/v2/farcaster/user/bulk', {
      fids: options.fid
    });
    return response.users[0];
  }

  async getUserByUsername(options: NeynarUserByUsernameOptions): Promise<NeynarV2User> {
    const response = await this.makeRequest<{ user: NeynarV2User }>('/v2/farcaster/user/by_username', {
      username: options.username
    });
    return response.user;
  }

  async getCastById(options: NeynarCastByIdOptions): Promise<NeynarHubCast> {
    return await this.makeRequest<NeynarHubCast>('/v1/castById', {
      fid: options.fid,
      hash: options.hash
    }, true);
  }
}
