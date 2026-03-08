import { Router } from "express";
import { z } from "zod";
import { hashSchema, fidSchema } from "../lib/schemas.js";
import { effectJson } from "../effect/express.js";
import { getCastEffect, getCastFormatEffect, type CastFormat } from "../services/cast.js";
import { validateParams, validateQuery } from "../lib/validate.js";

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
  effectJson((req) => {
    const { hash } = req.validatedParams as { hash: string };
    const query = req.validatedQuery as { format?: CastFormat; fid?: string };
    const { format, fid } = query ?? {};

    if (format) {
      return getCastFormatEffect(fid ?? "0", hash, format);
    }

    return getCastEffect(hash);
  })
);

export default router;
