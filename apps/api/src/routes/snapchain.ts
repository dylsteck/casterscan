import { Elysia, t } from "elysia";
import { getInfo, getEvent } from "../services/snapchain";

const eventParamsSchema = t.Object({ eventId: t.String() });
const eventQuerySchema = t.Object({
  shard_index: t.Optional(t.String()),
});

export const snapchainRoutes = new Elysia()
  .get("/v1/snapchain/info", async () => {
    const data = await getInfo();
    return data;
  })
  .get("/v1/snapchain/events/:eventId", async ({ params, query }) => {
    const shardIndex = query.shard_index ?? "0";
    const data = await getEvent(params.eventId, shardIndex);
    return data;
  }, {
    params: eventParamsSchema,
    query: eventQuerySchema,
  });
