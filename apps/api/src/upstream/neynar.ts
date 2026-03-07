import {
  NeynarV2Cast,
  NeynarV2User,
  NeynarHubCast,
  NeynarCastOptions,
  NeynarUserOptions,
  NeynarUsersOptions,
  NeynarUserByUsernameOptions,
  NeynarCastByIdOptions,
} from "./types.js";
import { UpstreamError } from "../lib/errors.js";

const BULK_FID_LIMIT = 100;

export type NeynarConfig = {
  baseUrl?: string;
  hubUrl?: string;
  apiKey?: string;
  timeout?: number;
};

export class Neynar {
  private baseUrl: string;
  private hubUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config: NeynarConfig = {}) {
    this.baseUrl = config.baseUrl ?? "https://api.neynar.com";
    this.hubUrl = config.hubUrl ?? "https://snapchain-api.neynar.com";
    this.apiKey = config.apiKey ?? "";
    this.timeout = config.timeout ?? 15000;
  }

  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string>,
    useHubUrl = false
  ): Promise<T> {
    const baseUrl = useHubUrl ? this.hubUrl : this.baseUrl;
    const url = new URL(`${baseUrl}${endpoint}`);

    try {
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new UpstreamError("neynar", `Resource not found: ${endpoint}`);
        }
        if (response.status === 400) {
          throw new UpstreamError("neynar", `Bad request: ${endpoint}`, response.status);
        }
        if (response.status === 401) {
          throw new UpstreamError("neynar", `Unauthorized: ${endpoint}`, response.status);
        }
        throw new UpstreamError(
          "neynar",
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new UpstreamError("neynar", `Request timeout: ${endpoint}`);
      }
      throw new UpstreamError(
        "neynar",
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getCast(options: NeynarCastOptions): Promise<NeynarV2Cast> {
    const response = await this.makeRequest<{ cast: NeynarV2Cast }>(
      "/v2/farcaster/cast",
      {
        identifier: options.identifier,
        type: options.type,
      }
    );
    return response.cast;
  }

  async getUser(options: NeynarUserOptions): Promise<NeynarV2User> {
    const response = await this.makeRequest<{ users: NeynarV2User[] }>(
      "/v2/farcaster/user/bulk",
      { fids: options.fid }
    );
    return response.users[0];
  }

  async getUsers(options: NeynarUsersOptions): Promise<NeynarV2User[]> {
    const uniqueFids = Array.from(new Set(options.fids.filter(Boolean)));

    if (uniqueFids.length === 0) {
      return [];
    }

    const chunks: string[][] = [];
    for (let i = 0; i < uniqueFids.length; i += BULK_FID_LIMIT) {
      chunks.push(uniqueFids.slice(i, i + BULK_FID_LIMIT));
    }

    const responses = await Promise.all(
      chunks.map((fids) =>
        this.makeRequest<{ users: NeynarV2User[] }>("/v2/farcaster/user/bulk", {
          fids: fids.join(","),
        })
      )
    );

    return responses.flatMap((response) => response.users ?? []);
  }

  async getUserByUsername(options: NeynarUserByUsernameOptions): Promise<NeynarV2User> {
    const response = await this.makeRequest<{ user: NeynarV2User }>(
      "/v2/farcaster/user/by_username",
      { username: options.username }
    );
    return response.user;
  }

  async getCastById(options: NeynarCastByIdOptions): Promise<NeynarHubCast> {
    return await this.makeRequest<NeynarHubCast>(
      "/v1/castById",
      { fid: options.fid, hash: options.hash },
      true
    );
  }
}
