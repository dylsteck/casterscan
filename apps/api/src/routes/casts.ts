import { Elysia, t } from "elysia";
import { getCast, getCastFormat, type CastFormat } from "../services/cast";
import { UpstreamError } from "../lib/errors";

const hashParamsSchema = t.Object({ hash: t.String() });
const formatQuerySchema = t.Object({
  format: t.Optional(
    t.Union([
      t.Literal("neynar-hub"),
      t.Literal("farcaster-hub"),
      t.Literal("farcaster-api"),
    ])
  ),
  fid: t.Optional(t.String()),
});

export const castsRoutes = new Elysia()
  .get("/v1/casts/:hash", async ({ params, query }) => {
    const { format, fid } = query;

    if (format) {
      if (!fid) {
        throw new UpstreamError(
          "casts",
          "fid is required when format is specified",
          400
        );
      }
      const data = await getCastFormat(
        fid,
        params.hash,
        format as CastFormat
      );
      return data;
    }

    const data = await getCast(params.hash);
    return data;
  }, {
    params: hashParamsSchema,
    query: formatQuerySchema,
  });
