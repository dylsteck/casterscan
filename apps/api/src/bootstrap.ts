import { initRedis } from "./cache/redis";
import { loadConfig, type Config } from "./config";
import { initUpstream } from "./upstream-instance";

let config: Config | null = null;
let initPromise: Promise<Config> | null = null;

export function getConfig(): Config {
  if (config) {
    return config;
  }

  config = loadConfig();
  return config;
}

export async function ensureInitialized(): Promise<Config> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = Promise.resolve().then(() => {
    const loadedConfig = getConfig();

    // Redis connects in the background so cold starts don't block requests.
    void initRedis(loadedConfig.REDIS_URL);
    initUpstream(loadedConfig);

    return loadedConfig;
  }).catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}
