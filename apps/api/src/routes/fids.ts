import { Elysia, t } from "elysia";
import { getFidStats, getFidMessages, getFidSigners } from "../services/fid";

const paramsSchema = t.Object({ fid: t.String() });
const signersQuerySchema = t.Object({
  pageSize: t.Optional(t.String()),
  pageToken: t.Optional(t.String()),
  reverse: t.Optional(t.String()),
  signer: t.Optional(t.String()),
});

export const fidsRoutes = new Elysia()
  .get("/v1/fids/:fid/stats", async ({ params }) => {
    const data = await getFidStats(params.fid);
    return data;
  }, { params: paramsSchema })
  .get("/v1/fids/:fid/messages", async ({ params }) => {
    const data = await getFidMessages(params.fid);
    return data;
  }, { params: paramsSchema })
  .get("/v1/fids/:fid/signers", async ({ params, query }) => {
    const data = await getFidSigners(params.fid, {
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      pageToken: query.pageToken,
      reverse: query.reverse === "true",
      signer: query.signer,
    });
    return data;
  }, { params: paramsSchema, query: signersQuerySchema });
