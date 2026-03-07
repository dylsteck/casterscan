import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getKeys } from "../services/keys.js";
import { validateParams, asyncHandler } from "../lib/validate.js";

const router = Router();
const fidParamsSchema = z.object({ fid: z.string() });

router.get("/:fid/keys", validateParams(fidParamsSchema), asyncHandler(async (req: Request, res: Response) => {
  const { fid } = req.validatedParams as { fid: string };
  const data = await getKeys(fid);
  res.json({
    ...data,
    fid: data.fid.toString(),
  });
}));

export default router;
