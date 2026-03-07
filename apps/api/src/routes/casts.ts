import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getCast, getCastFormat, type CastFormat } from "../services/cast.js";
import { UpstreamError } from "../lib/errors.js";
import { validateParams, validateQuery, asyncHandler } from "../lib/validate.js";

const router = Router();
const hashParamsSchema = z.object({ hash: z.string() });
const formatQuerySchema = z.object({
  format: z.enum(["neynar-hub", "farcaster-hub", "farcaster-api"]).optional(),
  fid: z.string().optional(),
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
      if ((format === "neynar-hub" || format === "farcaster-hub") && !fid) {
        throw new UpstreamError(
          "casts",
          "fid is required when format is neynar-hub or farcaster-hub",
          400
        );
      }
      const data = await getCastFormat(fid ?? "0", hash, format);
      res.json(data);
      return;
    }

    const data = await getCast(hash);
    res.json(data);
  })
);

export default router;
