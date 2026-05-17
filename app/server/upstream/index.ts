import { HypersnapClient } from "./hypersnap-client.js";
import { Snapchain } from "./snapchain.js";
import { Farcaster } from "./farcaster.js";
import { fetchKeysForFid } from "./keys.js";

export type UpstreamConfig = {
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
  const hypersnap = new HypersnapClient();
  const snapchain = new Snapchain(config.snapchain ?? {});
  const farcaster = new Farcaster(config.farcaster ?? {});

  const rpcUrl = config.optimismRpcUrl ?? "https://mainnet.optimism.io";

  const boundFetchKeysForFid = (fid: bigint, page?: number, pageSize?: number) =>
    fetchKeysForFid(rpcUrl, fid, page ?? 0, pageSize ?? 250);

  return {
    hypersnap,
    snapchain,
    farcaster,
    fetchKeysForFid: boundFetchKeysForFid,
  };
}

export { HypersnapClient, Snapchain, Farcaster, fetchKeysForFid };
export { UpstreamError } from "../lib/errors.js";
export * from "./types.js";
