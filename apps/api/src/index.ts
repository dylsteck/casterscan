import { loadConfig } from "./config";
import { initRedis } from "./cache/redis";
import { initUpstream } from "./upstream-instance";
import { app } from "./app";

async function main() {
  const config = loadConfig();
  await initRedis(config.REDIS_URL);
  initUpstream(config);

  app.listen(config.PORT);
  console.log(`Data layer listening on :${config.PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
