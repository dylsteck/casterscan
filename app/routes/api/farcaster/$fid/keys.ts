import { fidSchema, keysResponseSchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getKeys } from "@/app/server/services/keys.js";
import { handleRouteError, jsonWithCache, parseParams } from "@/app/server/http";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

const paramsSchema = z.object({ fid: fidSchema });

export const Route = createFileRoute("/api/farcaster/$fid/keys")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { fid } = parseParams(params, paramsSchema);
          await ensureInitialized();
          const data = await getKeys(fid);
          const response = keysResponseSchema.parse({
            ...data,
            fid: data.fid.toString(),
          });
          return jsonWithCache(response, CACHE_TTLS.LONG);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
