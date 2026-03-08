import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;
