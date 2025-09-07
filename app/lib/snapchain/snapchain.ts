import {
  SnapchainCastMessage,
  SnapchainReactionMessage,
  SnapchainLinkMessage,
  SnapchainVerificationMessage,
  SnapchainUserDataMessage,
  SnapchainCastsResponse,
  SnapchainReactionsResponse,
  SnapchainLinksResponse,
  SnapchainVerificationsResponse,
  SnapchainUserDataResponse,
  SnapchainOnChainSignersResponse,
  SnapchainInfoResponse,
  SnapchainEventResponse,
  SnapchainCastByIdResponse,
  SnapchainEventsResponse,
  SnapchainPaginationOptions,
  SnapchainCastsByFidOptions,
  SnapchainReactionsByFidOptions,
  SnapchainLinksByFidOptions,
  SnapchainVerificationsByFidOptions,
  SnapchainOnChainSignersByFidOptions,
  SnapchainCastByIdOptions,
  SnapchainEventByIdOptions,
  SnapchainErrorCode
} from './types';

export class SnapchainError extends Error {
  public code: SnapchainErrorCode;
  public details?: any;

  constructor(code: SnapchainErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'SnapchainError';
    this.code = code;
    this.details = details;
  }
}

export class Snapchain {
  private baseUrl: string;
  private timeout: number;
  private defaultPageSize: number;

  constructor(options: {
    baseUrl?: string;
    timeout?: number;
    defaultPageSize?: number;
  } = {}) {
    this.baseUrl = options.baseUrl || 'https://snap.farcaster.xyz:3381';
    this.timeout = options.timeout || 15000;
    this.defaultPageSize = options.defaultPageSize || 1000;
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        let errorCode: SnapchainError['code'];
        switch (response.status) {
          case 404:
            errorCode = 'NOT_FOUND';
            break;
          case 400:
            errorCode = 'BAD_REQUEST';
            break;
          case 500:
          case 502:
          case 503:
            errorCode = 'INTERNAL_ERROR';
            break;
          default:
            errorCode = 'NETWORK_ERROR';
        }
        
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new SnapchainError(
          errorCode,
          `HTTP ${response.status}: ${errorText}`,
          { status: response.status, statusText: response.statusText }
        );
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof SnapchainError) {
        throw error;
      }
      
      if ((error as any).name === 'TimeoutError' || (error as any).name === 'AbortError') {
        throw new SnapchainError('TIMEOUT', `Request timeout after ${this.timeout}ms`, error);
      }
      
      throw new SnapchainError('NETWORK_ERROR', `Network error: ${(error as any).message}`, error);
    }
  }

  private async makeCachedRequest<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(this.timeout),
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // 1 hour cache
    });
    
    if (!response.ok) {
      let errorCode: SnapchainError['code'];
      switch (response.status) {
        case 404:
          errorCode = 'NOT_FOUND';
          break;
        case 400:
          errorCode = 'BAD_REQUEST';
          break;
        case 500:
        case 502:
        case 503:
          errorCode = 'INTERNAL_ERROR';
          break;
        default:
          errorCode = 'NETWORK_ERROR';
      }
      
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new SnapchainError(
        errorCode,
        `HTTP ${response.status}: ${errorText}`,
        { status: response.status, statusText: response.statusText }
      );
    }
    
    return response.json();
  }

  private buildPaginationParams(options: SnapchainPaginationOptions): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {
      pageSize: options.pageSize || this.defaultPageSize
    };

    if (options.pageToken) params.pageToken = options.pageToken;
    if (options.reverse !== undefined) params.reverse = options.reverse;

    return params;
  }

  async getCastsByFid(options: SnapchainCastsByFidOptions): Promise<SnapchainCastsResponse> {
    const params = {
      fid: options.fid,
      ...this.buildPaginationParams(options)
    };

    return this.makeCachedRequest<SnapchainCastsResponse>('/v1/castsByFid', params);
  }

  async getReactionsByFid(options: SnapchainReactionsByFidOptions): Promise<SnapchainReactionsResponse> {
    const params = {
      fid: options.fid,
      reaction_type: options.reaction_type || 'None',
      ...this.buildPaginationParams(options)
    };

    return this.makeCachedRequest<SnapchainReactionsResponse>('/v1/reactionsByFid', params);
  }

  async getLinksByFid(options: SnapchainLinksByFidOptions): Promise<SnapchainLinksResponse> {
    const params = {
      fid: options.fid,
      ...this.buildPaginationParams(options)
    };

    return this.makeCachedRequest<SnapchainLinksResponse>('/v1/linksByFid', params);
  }

  async getVerificationsByFid(options: SnapchainVerificationsByFidOptions): Promise<SnapchainVerificationsResponse> {
    const params = {
      fid: options.fid,
      ...this.buildPaginationParams(options)
    };

    return this.makeCachedRequest<SnapchainVerificationsResponse>('/v1/verificationsByFid', params);
  }

  async getOnChainSignersByFid(options: SnapchainOnChainSignersByFidOptions): Promise<SnapchainOnChainSignersResponse> {
    const params: Record<string, string | number | boolean> = {
      fid: options.fid,
      ...this.buildPaginationParams(options)
    };

    if (options.signer) params.signer = options.signer;

    return this.makeCachedRequest<SnapchainOnChainSignersResponse>('/v1/onChainSignersByFid', params);
  }

  async getCastById(options: SnapchainCastByIdOptions): Promise<SnapchainCastByIdResponse> {
    const params = {
      fid: options.fid,
      hash: options.hash
    };

    return this.makeCachedRequest<SnapchainCastByIdResponse>('/v1/castById', params);
  }

  async getInfo(): Promise<SnapchainInfoResponse> {
    return this.makeRequest<SnapchainInfoResponse>('/v1/info');
  }

  async getEventById(options: SnapchainEventByIdOptions): Promise<SnapchainEventResponse> {
    const params = {
      event_id: options.event_id,
      shard_index: options.shard_index
    };

    return this.makeCachedRequest<SnapchainEventResponse>('/v1/eventById', params);
  }

  async getAllMessagesByFid(fid: string, endpoint: string, otherParams: Record<string, string | number | boolean> = {}): Promise<any[]> {
    const messages: any[] = [];
    let nextPageToken: string | undefined;

    while (true) {
      const params: Record<string, string | number | boolean> = {
        fid,
        pageSize: this.defaultPageSize,
        reverse: true,
        ...otherParams
      };

      if (nextPageToken) {
        params.pageToken = nextPageToken;
      }

      const data = await this.makeCachedRequest<any>(endpoint, params);
      messages.push(...(data.messages || []));

      if (!data.nextPageToken || data.messages?.length < this.defaultPageSize) {
        break;
      }

      nextPageToken = data.nextPageToken;
    }

    return messages;
  }

  async getAllCastsByFid(fid: string): Promise<SnapchainCastMessage[]> {
    return this.getAllMessagesByFid(fid, '/v1/castsByFid');
  }

  async getAllReactionsByFid(fid: string, reactionType?: string): Promise<SnapchainReactionMessage[]> {
    const params = reactionType ? { reaction_type: reactionType } : { reaction_type: 'None' };
    return this.getAllMessagesByFid(fid, '/v1/reactionsByFid', params);
  }

  async getAllLinksByFid(fid: string): Promise<SnapchainLinkMessage[]> {
    return this.getAllMessagesByFid(fid, '/v1/linksByFid');
  }

  async getAllVerificationsByFid(fid: string): Promise<SnapchainVerificationMessage[]> {
    return this.getAllMessagesByFid(fid, '/v1/verificationsByFid');
  }

  async getAllUserDataByFid(fid: string): Promise<SnapchainUserDataMessage[]> {
    return this.getAllMessagesByFid(fid, '/v1/userDataByFid');
  }

  async getSignerStats(fid: string, signer: string): Promise<{
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
    lastUsed: number | null;
  }> {
    const [casts, reactions, links, verifications] = await Promise.all([
      this.getAllCastsByFid(fid),
      this.getAllReactionsByFid(fid),
      this.getAllLinksByFid(fid),
      this.getAllVerificationsByFid(fid)
    ]);

    const filterBySigner = (messages: any[]) => 
      messages.filter((msg: any) => msg.signer === signer || 
        (msg.data && msg.data.signer === signer));

    const signerCasts = filterBySigner(casts);
    const signerReactions = filterBySigner(reactions);
    const signerLinks = filterBySigner(links);
    const signerVerifications = filterBySigner(verifications);

    const allMessages = [...signerCasts, ...signerReactions, ...signerLinks, ...signerVerifications];
    const lastUsed = allMessages.reduce((latest, msg) => {
      const timestamp = msg.data?.timestamp || msg.timestamp;
      if (timestamp && (!latest || timestamp > latest)) {
        return timestamp;
      }
      return latest;
    }, null);

    return {
      casts: signerCasts.length,
      reactions: signerReactions.length,
      links: signerLinks.length,
      verifications: signerVerifications.length,
      lastUsed
    };
  }

  isValidFid(fid: string | number): boolean {
    const fidNum = typeof fid === 'string' ? parseInt(fid, 10) : fid;
    return !isNaN(fidNum) && fidNum > 0 && fidNum <= Number.MAX_SAFE_INTEGER;
  }

  isValidHash(hash: string): boolean {
    return typeof hash === 'string' && hash.length > 0 && /^0x[a-fA-F0-9]+$/.test(hash);
  }

  formatTimestamp(timestamp: number): Date {
    const FARCASTER_EPOCH = 1609459200;
    return new Date((FARCASTER_EPOCH + timestamp) * 1000);
  }

  parseMessageType(type: string): string {
    const typeMap: Record<string, string> = {
      'MESSAGE_TYPE_CAST_ADD': 'Cast',
      'MESSAGE_TYPE_CAST_REMOVE': 'Cast Remove',
      'MESSAGE_TYPE_REACTION_ADD': 'Reaction',
      'MESSAGE_TYPE_REACTION_REMOVE': 'Reaction Remove',
      'MESSAGE_TYPE_LINK_ADD': 'Follow',
      'MESSAGE_TYPE_LINK_REMOVE': 'Unfollow',
      'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS': 'Verification',
      'MESSAGE_TYPE_VERIFICATION_REMOVE': 'Verification Remove'
    };
    return typeMap[type] || type;
  }

  parseReactionType(type: string): string {
    const typeMap: Record<string, string> = {
      'REACTION_TYPE_LIKE': 'Like',
      'REACTION_TYPE_RECAST': 'Recast',
      'REACTION_TYPE_NONE': 'None'
    };
    return typeMap[type] || type;
  }

  parseLinkType(type: string): string {
    const typeMap: Record<string, string> = {
      'LINK_TYPE_FOLLOW': 'Follow',
      'LINK_TYPE_UNFOLLOW': 'Unfollow'
    };
    return typeMap[type] || type;
  }

  parseSignerEventType(type: string): string {
    const typeMap: Record<string, string> = {
      'SIGNER_EVENT_TYPE_ADD': 'Add Signer',
      'SIGNER_EVENT_TYPE_REMOVE': 'Remove Signer'
    };
    return typeMap[type] || type;
  }

  parseUserDataType(type: string): string {
    const typeMap: Record<string, string> = {
      'USER_DATA_TYPE_PFP': 'Profile Picture',
      'USER_DATA_TYPE_DISPLAY': 'Display Name',
      'USER_DATA_TYPE_BIO': 'Bio',
      'USER_DATA_TYPE_URL': 'URL',
      'USER_DATA_TYPE_USERNAME': 'Username',
      'USER_DATA_TYPE_TWITTER': 'Twitter',
      'USER_DATA_PRIMARY_ADDRESS_ETHEREUM': 'Primary Ethereum Address',
      'USER_DATA_PRIMARY_ADDRESS_SOLANA': 'Primary Solana Address'
    };
    return typeMap[type] || type;
  }

  parseHubEventType(type: string): string {
    const typeMap: Record<string, string> = {
      'HUB_EVENT_TYPE_MERGE_MESSAGE': 'Message Added',
      'HUB_EVENT_TYPE_PRUNE_MESSAGE': 'Message Pruned',
      'HUB_EVENT_TYPE_REVOKE_MESSAGE': 'Message Revoked',
      'HUB_EVENT_TYPE_MERGE_ON_CHAIN_EVENT': 'On-Chain Event',
      'HUB_EVENT_TYPE_MERGE_USERNAME_PROOF': 'Username Proof',
      'HUB_EVENT_TYPE_MERGE_FAILURE': 'Merge Failure',
      'HUB_EVENT_TYPE_BLOCK_CONFIRMED': 'Block Confirmed'
    };
    return typeMap[type] || type;
  }

  parseOnChainEventType(type: string): string {
    const typeMap: Record<string, string> = {
      'EVENT_TYPE_SIGNER': 'Signer Event',
      'EVENT_TYPE_SIGNER_MIGRATED': 'Signer Migration',
      'EVENT_TYPE_ID_REGISTER': 'ID Registration',
      'EVENT_TYPE_STORAGE_RENT': 'Storage Rent'
    };
    return typeMap[type] || type;
  }

  parseUsernameType(type: string): string {
    const typeMap: Record<string, string> = {
      'USERNAME_TYPE_FNAME': 'Farcaster Name',
      'USERNAME_TYPE_ENS_L1': 'ENS L1 Name'
    };
    return typeMap[type] || type;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getTimeout(): number {
    return this.timeout;
  }

  getDefaultPageSize(): number {
    return this.defaultPageSize;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getInfo();
      return true;
    } catch {
      return false;
    }
  }

  createBatchProcessor<T>(
    requests: (() => Promise<T>)[],
    batchSize = 5,
    delayMs = 100
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let currentBatch = 0;

      const processBatch = async () => {
        const startIndex = currentBatch * batchSize;
        const endIndex = Math.min(startIndex + batchSize, requests.length);
        const batch = requests.slice(startIndex, endIndex);

        try {
          const batchResults = await Promise.all(batch.map(fn => fn()));
          results.push(...batchResults);

          currentBatch++;
          
          if (endIndex < requests.length) {
            setTimeout(processBatch, delayMs);
          } else {
            resolve(results);
          }
        } catch (error) {
          reject(error);
        }
      };

      processBatch();
    });
  }

  static createInstance(options?: {
    baseUrl?: string;
    timeout?: number;
    defaultPageSize?: number;
  }): Snapchain {
    return new Snapchain(options);
  }

  static getDefaultInstance(): Snapchain {
    if (!Snapchain._defaultInstance) {
      Snapchain._defaultInstance = new Snapchain();
    }
    return Snapchain._defaultInstance;
  }

  private static _defaultInstance: Snapchain | null = null;
}
