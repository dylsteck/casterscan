import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getKeys } from "../services/keys";
import { validateParams, asyncHandler } from "../lib/validate";

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
