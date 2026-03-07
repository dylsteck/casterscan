import express from "express";
import cors from "cors";
import { ensureInitialized } from "./bootstrap.js";
import { NotFoundError, UpstreamError } from "./lib/errors.js";
import healthRouter from "./routes/health.js";
import snapchainRouter from "./routes/snapchain.js";
import fidsRouter from "./routes/fids.js";
import signersRouter from "./routes/signers.js";
import keysRouter from "./routes/keys.js";
import usersRouter from "./routes/users.js";
import castsRouter from "./routes/casts.js";

const app = express();
app.use(cors());
app.use(express.json());

// Minimal ping route before init (for Vercel health checks)
app.get("/ping", (_req, res) => res.json({ ok: true }));

app.use(async (_req, _res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/", healthRouter);
app.use("/v1/snapchain", snapchainRouter);
app.use("/v1/users", usersRouter);
app.use("/v1/casts", castsRouter);
app.use("/v1/fids", signersRouter);
app.use("/v1/fids", keysRouter);
app.use("/v1/fids", fidsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof UpstreamError) {
    return res.status(err.status ?? 502).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal error" });
});

export default app;
