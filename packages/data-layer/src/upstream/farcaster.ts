import { FarcasterUserOptions, FarcasterCastOptions } from "./types";
import { UpstreamError } from "../lib/errors";

export type FarcasterConfig = {
  baseUrl?: string;
  timeout?: number;
};

export class Farcaster {
  private baseUrl: string;
  private timeout: number;

  constructor(config: FarcasterConfig = {}) {
    this.baseUrl = config.baseUrl ?? "https://api.farcaster.xyz";
    this.timeout = config.timeout ?? 15000;
  }

  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    try {
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new UpstreamError("farcaster", `Resource not found: ${endpoint}`);
        }
        if (response.status === 400) {
          throw new UpstreamError("farcaster", `Bad request: ${endpoint}`, response.status);
        }
        throw new UpstreamError(
          "farcaster",
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new UpstreamError("farcaster", `Request timeout: ${endpoint}`);
      }
      throw new UpstreamError(
        "farcaster",
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getUser(options: FarcasterUserOptions): Promise<unknown> {
    return this.makeRequest("/v2/user", { fid: options.fid });
  }

  async getCast(options: FarcasterCastOptions): Promise<unknown> {
    return this.makeRequest("/v2/thread-casts", { castHash: options.hash });
  }
}
