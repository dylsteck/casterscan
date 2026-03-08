import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { hashSchema, fidSchema } from "../lib/schemas.js";
import { getCast, getCastFormat, type CastFormat } from "../services/cast.js";
import { validateParams, validateQuery, asyncHandler } from "../lib/validate.js";

const router = Router();
const hashParamsSchema = z.object({ hash: hashSchema }).strict();
const formatQuerySchema = z.object({
  format: z.enum(["neynar-hub", "farcaster-hub", "farcaster-api"]).optional(),
  fid: fidSchema.optional(),
}).strict().superRefine((query, ctx) => {
  if ((query.format === "neynar-hub" || query.format === "farcaster-hub") && !query.fid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "fid is required when format is neynar-hub or farcaster-hub",
      path: ["fid"],
    });
  }
});

router.get(
  "/:hash",
  validateParams(hashParamsSchema),
  validateQuery(formatQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { hash } = req.validatedParams as { hash: string };
    const query = req.validatedQuery as { format?: CastFormat; fid?: string };
    const { format, fid } = query ?? {};

    if (format) {
      const data = await getCastFormat(fid ?? "0", hash, format);
      res.json(data);
      return;
    }

    const data = await getCast(hash);
    res.json(data);
  })
);

export default router;
