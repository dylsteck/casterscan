import express from "express";
import cors from "cors";
import { ensureInitialized } from "./bootstrap";
import { NotFoundError, UpstreamError } from "./lib/errors";
import healthRouter from "./routes/health";
import snapchainRouter from "./routes/snapchain";
import fidsRouter from "./routes/fids";
import signersRouter from "./routes/signers";
import keysRouter from "./routes/keys";
import usersRouter from "./routes/users";
import castsRouter from "./routes/casts";

const app = express();
app.use(cors());
app.use(express.json());
app.use(async (_req, _res, next) => {
  await ensureInitialized();
  next();
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
