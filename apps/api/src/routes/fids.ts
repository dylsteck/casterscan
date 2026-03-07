import { Elysia, t } from "elysia";
import { getFidStats, getFidMessages } from "../services/fid";

const paramsSchema = t.Object({ fid: t.String() });

export const fidsRoutes = new Elysia()
  .get("/v1/fids/:fid/stats", async ({ params }) => {
    const data = await getFidStats(params.fid);
    return data;
  }, { params: paramsSchema })
  .get("/v1/fids/:fid/messages", async ({ params }) => {
    const data = await getFidMessages(params.fid);
    return data;
  }, { params: paramsSchema });
