import { Router } from "express";
import { z } from "zod";
import { fidSchema, signerKeySchema } from "../lib/schemas.js";
import {
  getSignersEnrichedEffect,
  getSignerMessagesEffect,
  getSignerStatsEffect,
} from "../services/signer.js";
import { effectJson } from "../effect/express.js";
import { validateParams } from "../lib/validate.js";

const router = Router();
const fidParamsSchema = z.object({ fid: fidSchema }).strict();
const fidSignerParamsSchema = z.object({
  fid: fidSchema,
  signerKey: signerKeySchema,
}).strict();

router.get("/:fid/signers/enriched", validateParams(fidParamsSchema), effectJson((req) => {
  const { fid } = req.validatedParams as { fid: string };
  return getSignersEnrichedEffect(fid);
}));

router.get(
  "/:fid/signers/:signerKey/messages",
  validateParams(fidSignerParamsSchema),
  effectJson((req) => {
    const { fid, signerKey } = req.validatedParams as { fid: string; signerKey: string };
    return getSignerMessagesEffect(fid, signerKey);
  })
);

router.get(
  "/:fid/signers/:signerKey/stats",
  validateParams(fidSignerParamsSchema),
  effectJson((req) => {
    const { fid, signerKey } = req.validatedParams as { fid: string; signerKey: string };
    return getSignerStatsEffect(fid, signerKey);
  })
);

export default router;
