import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  fidSchema,
  pageSizeQuerySchema,
  pageTokenSchema,
  reverseQuerySchema,
  signerKeySchema,
} from "../lib/schemas.js";
import { getFidStats, getFidMessages, getFidSigners } from "../services/fid.js";
import { validateParams, validateQuery, asyncHandler } from "../lib/validate.js";

const router = Router();
const paramsSchema = z.object({ fid: fidSchema }).strict();
const signersQuerySchema = z.object({
  pageSize: pageSizeQuerySchema.optional(),
  pageToken: pageTokenSchema.optional(),
  reverse: reverseQuerySchema.optional(),
  signer: signerKeySchema.optional(),
}).strict();

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
    const query = req.validatedQuery as {
      pageSize?: number;
      pageToken?: string;
      reverse?: boolean;
      signer?: string;
    };
    const data = await getFidSigners(fid, {
      pageSize: query?.pageSize,
      pageToken: query?.pageToken,
      reverse: query?.reverse,
      signer: query?.signer,
    });
    res.json(data);
  })
);

export default router;
