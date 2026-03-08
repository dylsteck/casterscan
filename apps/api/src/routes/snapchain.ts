import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { eventIdSchema, shardIndexSchema } from "../lib/schemas.js";
import { getInfo, getEvent } from "../services/snapchain.js";
import { validateParams, validateQuery, asyncHandler } from "../lib/validate.js";

const router = Router();
const eventParamsSchema = z.object({ eventId: eventIdSchema }).strict();
const eventQuerySchema = z.object({ shard_index: shardIndexSchema.optional() }).strict();

router.get("/info", asyncHandler(async (_req: Request, res: Response) => {
  const data = await getInfo();
  res.json(data);
}));

router.get(
  "/events/:eventId",
  validateParams(eventParamsSchema),
  validateQuery(eventQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.validatedParams as { eventId: string };
    const shardIndex = (req.validatedQuery as { shard_index?: string })?.shard_index ?? "0";
    const data = await getEvent(eventId, shardIndex);
    res.json(data);
  })
);

export default router;
