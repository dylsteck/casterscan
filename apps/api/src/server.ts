import app from "./app";
import { ensureInitialized, getConfig } from "./bootstrap";

const config = getConfig();

await ensureInitialized();

if (!process.env.VERCEL) {
  app.listen(config.PORT);
  console.log(`API listening on :${config.PORT}`);
}
