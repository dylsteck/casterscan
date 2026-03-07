import { loadConfig } from "./config";
import { initRedis } from "./cache/redis";
import { initUpstream } from "./upstream-instance";

const config = loadConfig();
void initRedis(config.REDIS_URL);
initUpstream(config);

// Dynamic import breaks circular deps that cause "module not instantiated" on Vercel/Bun
const { app } = await import("./app");

if (!process.env.VERCEL) {
  app.listen(config.PORT);
  console.log(`API listening on :${config.PORT}`);
}

export default app;
