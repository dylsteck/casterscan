import { Router } from "express";
import { z } from "zod";
import { fidSchema } from "../lib/schemas.js";
import { Effect } from "effect";
import { effectJson } from "../effect/express.js";
import { getKeysEffect } from "../services/keys.js";
import { validateParams } from "../lib/validate.js";

const router = Router();
const fidParamsSchema = z.object({ fid: fidSchema }).strict();

router.get("/:fid/keys", validateParams(fidParamsSchema), effectJson((req) => {
  const { fid } = req.validatedParams as { fid: string };

  return Effect.map(getKeysEffect(fid), (data) => ({
    ...data,
    fid: data.fid.toString(),
  }));
}));

export default router;
