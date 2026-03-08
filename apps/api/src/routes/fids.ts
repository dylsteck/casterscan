import { Router } from "express";
import { z } from "zod";
import {
  fidSchema,
  pageSizeQuerySchema,
  pageTokenSchema,
  reverseQuerySchema,
  signerKeySchema,
} from "../lib/schemas.js";
import { effectJson } from "../effect/express.js";
import { getFidStatsEffect, getFidMessagesEffect, getFidSignersEffect } from "../services/fid.js";
import { validateParams, validateQuery } from "../lib/validate.js";

const router = Router();
const paramsSchema = z.object({ fid: fidSchema }).strict();
const signersQuerySchema = z.object({
  pageSize: pageSizeQuerySchema.optional(),
  pageToken: pageTokenSchema.optional(),
  reverse: reverseQuerySchema.optional(),
  signer: signerKeySchema.optional(),
}).strict();

router.get("/:fid/stats", validateParams(paramsSchema), effectJson((req) => {
  const { fid } = req.validatedParams as { fid: string };
  return getFidStatsEffect(fid);
}));

router.get("/:fid/messages", validateParams(paramsSchema), effectJson((req) => {
  const { fid } = req.validatedParams as { fid: string };
  return getFidMessagesEffect(fid);
}));

router.get(
  "/:fid/signers",
  validateParams(paramsSchema),
  validateQuery(signersQuerySchema),
  effectJson((req) => {
    const { fid } = req.validatedParams as { fid: string };
    const query = req.validatedQuery as {
      pageSize?: number;
      pageToken?: string;
      reverse?: boolean;
      signer?: string;
    };
    return getFidSignersEffect(fid, {
      pageSize: query?.pageSize,
      pageToken: query?.pageToken,
      reverse: query?.reverse,
      signer: query?.signer,
    });
  })
);

export default router;
