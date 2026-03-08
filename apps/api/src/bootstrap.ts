import type { Config } from "./config.js";
import { ensureEffectRuntime, getEffectConfig } from "./effect/runtime.js";

let initPromise: Promise<Config> | null = null;

export function getConfig(): Config {
  return getEffectConfig();
}

export async function ensureInitialized(): Promise<Config> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = ensureEffectRuntime()
    .then(() => getConfig())
    .catch((error) => {
      initPromise = null;
      throw error;
    });

  return initPromise;
}
