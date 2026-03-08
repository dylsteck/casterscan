import { Router } from "express";
import { z } from "zod";
import { fidSchema, usernameSchema } from "../lib/schemas.js";
import { effectJson } from "../effect/express.js";
import { getUserEffect, getUserByUsernameEffect, getUsersBulkEffect } from "../services/user.js";
import { validateParams, validateBody } from "../lib/validate.js";

const router = Router();
const fidParamsSchema = z.object({ fid: fidSchema }).strict();
const usernameParamsSchema = z.object({ username: usernameSchema }).strict();
const bulkBodySchema = z.object({ fids: z.array(fidSchema).max(100) }).strict();

router.get(
  "/by-username/:username",
  validateParams(usernameParamsSchema),
  effectJson((req) => {
    const { username } = req.validatedParams as { username: string };
    return getUserByUsernameEffect(username);
  })
);

router.post("/bulk", validateBody(bulkBodySchema), effectJson((req) => {
  const { fids } = req.validatedBody as { fids: string[] };
  return getUsersBulkEffect(fids);
}));

router.get("/:fid", validateParams(fidParamsSchema), effectJson((req) => {
  const { fid } = req.validatedParams as { fid: string };
  return getUserEffect(fid);
}));

export default router;
