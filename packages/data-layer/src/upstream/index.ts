import { Neynar } from "./neynar";
import { Snapchain } from "./snapchain";
import { Farcaster } from "./farcaster";
import { fetchKeysForFid } from "./keys";

export type UpstreamConfig = {
  neynar?: {
    baseUrl?: string;
    hubUrl?: string;
    apiKey?: string;
    timeout?: number;
  };
  snapchain?: {
    baseUrl?: string;
    timeout?: number;
    defaultPageSize?: number;
  };
  farcaster?: {
    baseUrl?: string;
    timeout?: number;
  };
  optimismRpcUrl?: string;
};

export function createUpstream(config: UpstreamConfig = {}) {
  const neynar = new Neynar(config.neynar ?? {});
  const snapchain = new Snapchain(config.snapchain ?? {});
  const farcaster = new Farcaster(config.farcaster ?? {});

  const rpcUrl = config.optimismRpcUrl ?? "https://mainnet.optimism.io";

  const boundFetchKeysForFid = (fid: bigint, page?: number, pageSize?: number) =>
    fetchKeysForFid(rpcUrl, fid, page ?? 0, pageSize ?? 250);

  return {
    neynar,
    snapchain,
    farcaster,
    fetchKeysForFid: boundFetchKeysForFid,
  };
}

export { Neynar, Snapchain, Farcaster, fetchKeysForFid };
export { UpstreamError } from "../lib/errors";
export * from "./types";
