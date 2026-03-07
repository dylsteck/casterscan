import { createUpstream } from "./upstream/index.js";
import type { Config } from "./config.js";
import type { UpstreamConfig } from "./upstream/index.js";

export let upstream: ReturnType<typeof createUpstream> | null = null;

export function getUpstream() {
  return upstream;
}

export function initUpstream(config: Config) {
  const upstreamConfig: UpstreamConfig = {
    neynar: { apiKey: config.NEYNAR_API_KEY },
    snapchain: { baseUrl: config.SNAPCHAIN_URL },
    farcaster: { baseUrl: config.FARCASTER_API_URL },
    optimismRpcUrl: config.OPTIMISM_RPC_URL,
  };
  upstream = createUpstream(upstreamConfig);
}
