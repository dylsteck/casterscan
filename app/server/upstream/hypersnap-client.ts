import type {
  HypersnapCastByIdOptions,
  HypersnapCastOptions,
  HypersnapHubCast,
  HypersnapUserByUsernameOptions,
  HypersnapUserOptions,
  HypersnapUsersOptions,
  HypersnapV2Cast,
  HypersnapV2User,
} from "./types.js";
import { UpstreamError } from "../lib/errors.js";

const BULK_FID_LIMIT = 100;

/** Public Hypersnap HTTP mirror (v2 Farcaster-style REST + hub castById on the same host). */
export const HYPERSNAP_BASE_URL = "https://haatz.quilibrium.com" as const;

/** Typed path segments for the Hypersnap HTTP API. */
export const hypersnapPaths = {
  v2: {
    farcasterCast: "/v2/farcaster/cast",
    farcasterUserBulk: "/v2/farcaster/user/bulk",
    farcasterUserByUsername: "/v2/farcaster/user/by_username",
  },
  hub: {
    castById: "/v1/castById",
  },
} as const;

export type HypersnapPath =
  | (typeof hypersnapPaths.v2)[keyof typeof hypersnapPaths.v2]
  | (typeof hypersnapPaths.hub)[keyof typeof hypersnapPaths.hub];

export class HypersnapClient {
  private readonly timeout: number;

  constructor(config: { timeout?: number } = {}) {
    this.timeout = config.timeout ?? 15000;
  }

  private async getJson<T>(path: HypersnapPath, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${HYPERSNAP_BASE_URL}${path}`);

    try {
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.append(key, value);
        }
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new UpstreamError("hypersnap", `Resource not found: ${path}`);
        }
        if (response.status === 400) {
          throw new UpstreamError("hypersnap", `Bad request: ${path}`, response.status);
        }
        if (response.status === 401) {
          throw new UpstreamError("hypersnap", `Unauthorized: ${path}`, response.status);
        }
        throw new UpstreamError(
          "hypersnap",
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new UpstreamError("hypersnap", `Request timeout: ${path}`);
      }
      throw new UpstreamError(
        "hypersnap",
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getCast(options: HypersnapCastOptions): Promise<HypersnapV2Cast> {
    const response = await this.getJson<{ cast: HypersnapV2Cast }>(hypersnapPaths.v2.farcasterCast, {
      identifier: options.identifier,
      type: options.type,
    });
    return response.cast;
  }

  async getUser(options: HypersnapUserOptions): Promise<HypersnapV2User> {
    const response = await this.getJson<{ users: HypersnapV2User[] }>(hypersnapPaths.v2.farcasterUserBulk, {
      fids: options.fid,
    });
    return response.users[0];
  }

  async getUsers(options: HypersnapUsersOptions): Promise<HypersnapV2User[]> {
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
        this.getJson<{ users: HypersnapV2User[] }>(hypersnapPaths.v2.farcasterUserBulk, {
          fids: fids.join(","),
        })
      )
    );

    return responses.flatMap((response) => response.users ?? []);
  }

  async getUserByUsername(options: HypersnapUserByUsernameOptions): Promise<HypersnapV2User> {
    const response = await this.getJson<{ user: HypersnapV2User }>(
      hypersnapPaths.v2.farcasterUserByUsername,
      { username: options.username }
    );
    return response.user;
  }

  async getCastById(options: HypersnapCastByIdOptions): Promise<HypersnapHubCast> {
    return await this.getJson<HypersnapHubCast>(hypersnapPaths.hub.castById, {
      fid: options.fid,
      hash: options.hash,
    });
  }
}
