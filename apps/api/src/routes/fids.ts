import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getFidStats, getFidMessages, getFidSigners } from "../services/fid.js";
import { validateParams, validateQuery, asyncHandler } from "../lib/validate.js";

const router = Router();
const paramsSchema = z.object({ fid: z.string() });
const signersQuerySchema = z.object({
  pageSize: z.string().optional(),
  pageToken: z.string().optional(),
  reverse: z.string().optional(),
  signer: z.string().optional(),
});

router.get("/:fid/stats", validateParams(paramsSchema), asyncHandler(async (req: Request, res: Response) => {
  const { fid } = req.validatedParams as { fid: string };
  const data = await getFidStats(fid);
  res.json(data);
}));

router.get("/:fid/messages", validateParams(paramsSchema), asyncHandler(async (req: Request, res: Response) => {
  const { fid } = req.validatedParams as { fid: string };
  const data = await getFidMessages(fid);
  res.json(data);
}));

router.get(
  "/:fid/signers",
  validateParams(paramsSchema),
  validateQuery(signersQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { fid } = req.validatedParams as { fid: string };
    const query = req.validatedQuery as { pageSize?: string; pageToken?: string; reverse?: string; signer?: string };
    const data = await getFidSigners(fid, {
      pageSize: query?.pageSize ? parseInt(query.pageSize) : undefined,
      pageToken: query?.pageToken,
      reverse: query?.reverse === "true",
      signer: query?.signer,
    });
    res.json(data);
  })
);

export default router;
