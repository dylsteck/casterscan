import { Elysia, t } from "elysia";
import { getKeys } from "../services/keys";

const fidParamsSchema = t.Object({ fid: t.String() });

export const keysRoutes = new Elysia().get(
  "/v1/fids/:fid/keys",
  async ({ params }) => {
    const data = await getKeys(params.fid);
    return {
      ...data,
      fid: data.fid.toString(),
    };
  },
  { params: fidParamsSchema }
);
