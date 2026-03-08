import { Context, Layer } from "effect";
import { loadConfig, type Config } from "../config.js";

const loadedConfig = loadConfig();

export class AppConfig extends Context.Tag("@casterscan/api/AppConfig")<AppConfig, Config>() {}

export const AppConfigLive = Layer.succeed(AppConfig, loadedConfig);

export function getLoadedConfig(): Config {
  return loadedConfig;
}
