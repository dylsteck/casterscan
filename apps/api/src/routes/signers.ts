import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { fidSchema, signerKeySchema } from "../lib/schemas.js";
import {
  getSignersEnriched,
  getSignerMessages,
  getSignerStats,
} from "../services/signer.js";
import { validateParams, asyncHandler } from "../lib/validate.js";

const router = Router();
const fidParamsSchema = z.object({ fid: fidSchema });
const fidSignerParamsSchema = z.object({
  fid: fidSchema,
  signerKey: signerKeySchema,
});

router.get("/:fid/signers/enriched", validateParams(fidParamsSchema), asyncHandler(async (req: Request, res: Response) => {
  const { fid } = req.validatedParams as { fid: string };
  const data = await getSignersEnriched(fid);
  res.json(data);
}));

router.get(
  "/:fid/signers/:signerKey/messages",
  validateParams(fidSignerParamsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { fid, signerKey } = req.validatedParams as { fid: string; signerKey: string };
    const data = await getSignerMessages(fid, signerKey);
    res.json(data);
  })
);

router.get(
  "/:fid/signers/:signerKey/stats",
  validateParams(fidSignerParamsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { fid, signerKey } = req.validatedParams as { fid: string; signerKey: string };
    const data = await getSignerStats(fid, signerKey);
    res.json(data);
  })
);

export default router;
