import { Context, Effect, Layer } from "effect";
import type { Config } from "../config.js";
import { createUpstream, type UpstreamConfig } from "../upstream/index.js";
import { AppConfig, AppConfigLive } from "./config.js";

function toUpstreamConfig(config: Config): UpstreamConfig {
  return {
    neynar: { apiKey: config.NEYNAR_API_KEY },
    snapchain: { baseUrl: config.SNAPCHAIN_URL },
    farcaster: { baseUrl: config.FARCASTER_API_URL },
    optimismRpcUrl: config.OPTIMISM_RPC_URL,
  };
}

export type AppUpstream = ReturnType<typeof createUpstream>;

export class Upstream extends Context.Tag("@casterscan/api/Upstream")<Upstream, AppUpstream>() {}

export const UpstreamLive = Layer.effect(
  Upstream,
  Effect.gen(function* () {
    const config = yield* AppConfig;
    return createUpstream(toUpstreamConfig(config));
  })
).pipe(Layer.provide(AppConfigLive));
