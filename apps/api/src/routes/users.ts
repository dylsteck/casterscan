import { Elysia, t } from "elysia";
import { getUser, getUserByUsername, getUsersBulk } from "../services/user";

const fidParamsSchema = t.Object({ fid: t.String() });
const usernameParamsSchema = t.Object({ username: t.String() });
const bulkBodySchema = t.Object({ fids: t.Array(t.String()) });

export const usersRoutes = new Elysia()
  .get("/v1/users/:fid", async ({ params }) => {
    const data = await getUser(params.fid);
    return data;
  }, { params: fidParamsSchema })
  .get("/v1/users/by-username/:username", async ({ params }) => {
    const data = await getUserByUsername(params.username);
    return data;
  }, { params: usernameParamsSchema })
  .post("/v1/users/bulk", async ({ body }) => {
    const data = await getUsersBulk(body.fids);
    return data;
  }, { body: bulkBodySchema });
