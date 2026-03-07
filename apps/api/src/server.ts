import app from "./app.js";
import { ensureInitialized, getConfig } from "./bootstrap.js";

const config = getConfig();

await ensureInitialized();

if (!process.env.VERCEL) {
  app.listen(config.PORT);
  console.log(`API listening on :${config.PORT}`);
}
