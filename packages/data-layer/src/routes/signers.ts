import { Elysia, t } from "elysia";
import {
  getSignersEnriched,
  getSignerMessages,
  getSignerStats,
} from "../services/signer";

const fidParamsSchema = t.Object({ fid: t.String() });
const fidSignerParamsSchema = t.Object({
  fid: t.String(),
  signerKey: t.String(),
});

export const signersRoutes = new Elysia()
  .get("/v1/fids/:fid/signers/enriched", async ({ params }) => {
    const data = await getSignersEnriched(params.fid);
    return data;
  }, { params: fidParamsSchema })
  .get("/v1/fids/:fid/signers/:signerKey/messages", async ({ params }) => {
    const data = await getSignerMessages(params.fid, params.signerKey);
    return data;
  }, { params: fidSignerParamsSchema })
  .get("/v1/fids/:fid/signers/:signerKey/stats", async ({ params }) => {
    const data = await getSignerStats(params.fid, params.signerKey);
    return data;
  }, { params: fidSignerParamsSchema });
