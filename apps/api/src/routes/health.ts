import { Router, type Request, type Response } from "express";
import { redis } from "../cache/redis.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    redis: redis !== null,
  });
});

export default router;
