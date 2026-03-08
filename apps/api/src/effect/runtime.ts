import { Effect, Layer, ManagedRuntime } from "effect";
import type { Config } from "../config.js";
import { CacheLive } from "./cache.js";
import { AppConfigLive, getLoadedConfig } from "./config.js";
import { UpstreamLive } from "./upstream.js";

export const ApiLive = Layer.mergeAll(AppConfigLive, CacheLive, UpstreamLive);

const runtime = ManagedRuntime.make(ApiLive);
let initPromise: Promise<void> | null = null;

export function getEffectConfig(): Config {
  return getLoadedConfig();
}

export function runAppEffect<A, E, R>(program: Effect.Effect<A, E, R>): Promise<A> {
  return runtime.runPromise(program as Effect.Effect<A, E, never>);
}

export async function ensureEffectRuntime(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = runAppEffect(Effect.void).catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}
