import { loadConfig } from "./config";
import { initRedis } from "./cache/redis";
import { initUpstream } from "./upstream-instance";
import { app } from "./app";

const config = loadConfig();
await initRedis(config.REDIS_URL);
initUpstream(config);

// Vercel uses the default export as the serverless handler; no app.listen()
if (!process.env.VERCEL) {
  app.listen(config.PORT);
  console.log(`API listening on :${config.PORT}`);
}

export default app;
