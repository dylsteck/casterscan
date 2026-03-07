import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getUser, getUserByUsername, getUsersBulk } from "../services/user";
import { validateParams, validateBody, asyncHandler } from "../lib/validate";

const router = Router();
const fidParamsSchema = z.object({ fid: z.string() });
const usernameParamsSchema = z.object({ username: z.string() });
const bulkBodySchema = z.object({ fids: z.array(z.string()) });

router.get(
  "/by-username/:username",
  validateParams(usernameParamsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.validatedParams as { username: string };
    const data = await getUserByUsername(username);
    res.json(data);
  })
);

router.post("/bulk", validateBody(bulkBodySchema), asyncHandler(async (req: Request, res: Response) => {
  const { fids } = req.validatedBody as { fids: string[] };
  const data = await getUsersBulk(fids);
  res.json(data);
}));

router.get("/:fid", validateParams(fidParamsSchema), asyncHandler(async (req: Request, res: Response) => {
  const { fid } = req.validatedParams as { fid: string };
  const data = await getUser(fid);
  res.json(data);
}));

export default router;
