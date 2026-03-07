import { createUpstream } from "./upstream";
import type { Config } from "./config";
import type { UpstreamConfig } from "./upstream";

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
