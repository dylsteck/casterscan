import {
  SnapchainCastMessage,
  SnapchainReactionMessage,
  SnapchainLinkMessage,
  SnapchainVerificationMessage,
  SnapchainCastsResponse,
  SnapchainReactionsResponse,
  SnapchainLinksResponse,
  SnapchainVerificationsResponse,
  SnapchainOnChainSignersResponse,
  SnapchainInfoResponse,
  SnapchainEventResponse,
  SnapchainCastByIdResponse,
  SnapchainPaginationOptions,
  SnapchainCastsByFidOptions,
  SnapchainReactionsByFidOptions,
  SnapchainLinksByFidOptions,
  SnapchainVerificationsByFidOptions,
  SnapchainOnChainSignersByFidOptions,
  SnapchainCastByIdOptions,
  SnapchainEventByIdOptions,
} from "./types";
import { UpstreamError } from "../lib/errors";

export type SnapchainConfig = {
  baseUrl?: string;
  timeout?: number;
  defaultPageSize?: number;
};

export class Snapchain {
  private baseUrl: string;
  private timeout: number;
  private defaultPageSize: number;

  constructor(config: SnapchainConfig = {}) {
    this.baseUrl = config.baseUrl ?? "https://snap.farcaster.xyz:3381";
    this.timeout = config.timeout ?? 15000;
    this.defaultPageSize = config.defaultPageSize ?? 1000;
  }

  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
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
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        if (response.status === 404) {
          throw new UpstreamError("snapchain", `Not found: ${errorText}`, response.status);
        }
        if (response.status === 400) {
          throw new UpstreamError("snapchain", `Bad request: ${errorText}`, response.status);
        }
        if (response.status === 500 || response.status === 502 || response.status === 503) {
          throw new UpstreamError("snapchain", `Internal error: ${errorText}`, response.status);
        }
        throw new UpstreamError(
          "snapchain",
          `HTTP ${response.status}: ${errorText}`,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      if (
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError")
      ) {
        throw new UpstreamError("snapchain", `Request timeout after ${this.timeout}ms`);
      }
      throw new UpstreamError(
        "snapchain",
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private buildPaginationParams(
    options: SnapchainPaginationOptions
  ): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {
      pageSize: options.pageSize ?? this.defaultPageSize,
    };
    if (options.pageToken) params.pageToken = options.pageToken;
    if (options.reverse !== undefined) params.reverse = options.reverse;
    return params;
  }

  async getCastsByFid(options: SnapchainCastsByFidOptions): Promise<SnapchainCastsResponse> {
    const params = {
      fid: options.fid,
      ...this.buildPaginationParams(options),
    };
    return this.makeRequest<SnapchainCastsResponse>("/v1/castsByFid", params);
  }

  async getReactionsByFid(
    options: SnapchainReactionsByFidOptions
  ): Promise<SnapchainReactionsResponse> {
    const params = {
      fid: options.fid,
      reaction_type: options.reaction_type ?? "None",
      ...this.buildPaginationParams(options),
    };
    return this.makeRequest<SnapchainReactionsResponse>("/v1/reactionsByFid", params);
  }

  async getLinksByFid(options: SnapchainLinksByFidOptions): Promise<SnapchainLinksResponse> {
    const params = {
      fid: options.fid,
      ...this.buildPaginationParams(options),
    };
    return this.makeRequest<SnapchainLinksResponse>("/v1/linksByFid", params);
  }

  async getVerificationsByFid(
    options: SnapchainVerificationsByFidOptions
  ): Promise<SnapchainVerificationsResponse> {
    const params = {
      fid: options.fid,
      ...this.buildPaginationParams(options),
    };
    return this.makeRequest<SnapchainVerificationsResponse>("/v1/verificationsByFid", params);
  }

  async getOnChainSignersByFid(
    options: SnapchainOnChainSignersByFidOptions
  ): Promise<SnapchainOnChainSignersResponse> {
    const params: Record<string, string | number | boolean> = {
      fid: options.fid,
      ...this.buildPaginationParams(options),
    };
    if (options.signer) params.signer = options.signer;
    return this.makeRequest<SnapchainOnChainSignersResponse>("/v1/onChainSignersByFid", params);
  }

  async getCastById(options: SnapchainCastByIdOptions): Promise<SnapchainCastByIdResponse> {
    return this.makeRequest<SnapchainCastByIdResponse>("/v1/castById", {
      fid: options.fid,
      hash: options.hash,
    });
  }

  async getInfo(): Promise<SnapchainInfoResponse> {
    return this.makeRequest<SnapchainInfoResponse>("/v1/info");
  }

  async getEventById(options: SnapchainEventByIdOptions): Promise<SnapchainEventResponse> {
    return this.makeRequest<SnapchainEventResponse>("/v1/eventById", {
      event_id: options.event_id,
      shard_index: options.shard_index,
    });
  }

  private async getAllMessagesByFid(
    fid: string,
    endpoint: string,
    otherParams: Record<string, string | number | boolean> = {}
  ): Promise<SnapchainCastMessage[] | SnapchainReactionMessage[] | SnapchainLinkMessage[] | SnapchainVerificationMessage[]> {
    const messages: any[] = [];
    let nextPageToken: string | undefined;

    while (true) {
      const params: Record<string, string | number | boolean> = {
        fid,
        pageSize: this.defaultPageSize,
        reverse: true,
        ...otherParams,
      };
      if (nextPageToken) params.pageToken = nextPageToken;

      const data = await this.makeRequest<{ messages?: any[]; nextPageToken?: string }>(
        endpoint,
        params
      );
      messages.push(...(data.messages ?? []));

      if (!data.nextPageToken || (data.messages?.length ?? 0) < this.defaultPageSize) {
        break;
      }
      nextPageToken = data.nextPageToken;
    }

    return messages;
  }

  async getAllCastsByFid(fid: string): Promise<SnapchainCastMessage[]> {
    return this.getAllMessagesByFid(fid, "/v1/castsByFid") as Promise<SnapchainCastMessage[]>;
  }

  async getAllReactionsByFid(
    fid: string,
    reactionType?: string
  ): Promise<SnapchainReactionMessage[]> {
    const params = reactionType ? { reaction_type: reactionType } : { reaction_type: "None" };
    return this.getAllMessagesByFid(fid, "/v1/reactionsByFid", params) as Promise<
      SnapchainReactionMessage[]
    >;
  }

  async getAllLinksByFid(fid: string): Promise<SnapchainLinkMessage[]> {
    return this.getAllMessagesByFid(fid, "/v1/linksByFid") as Promise<SnapchainLinkMessage[]>;
  }

  async getAllVerificationsByFid(fid: string): Promise<SnapchainVerificationMessage[]> {
    return this.getAllMessagesByFid(fid, "/v1/verificationsByFid") as Promise<
      SnapchainVerificationMessage[]
    >;
  }
}
