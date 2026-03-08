import { Router } from "express";
import { z } from "zod";
import { eventIdSchema, shardIndexSchema } from "../lib/schemas.js";
import { effectJson } from "../effect/express.js";
import { getInfoEffect, getEventEffect } from "../services/snapchain.js";
import { validateParams, validateQuery } from "../lib/validate.js";

const router = Router();
const eventParamsSchema = z.object({ eventId: eventIdSchema }).strict();
const eventQuerySchema = z.object({ shard_index: shardIndexSchema.optional() }).strict();

router.get("/info", effectJson(() => getInfoEffect()));

router.get(
  "/events/:eventId",
  validateParams(eventParamsSchema),
  validateQuery(eventQuerySchema),
  effectJson((req) => {
    const { eventId } = req.validatedParams as { eventId: string };
    const shardIndex = (req.validatedQuery as { shard_index?: string })?.shard_index ?? "0";
    return getEventEffect(eventId, shardIndex);
  })
);

export default router;
