import { farcasterFidQuerySchema, fidSchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getFidSigners } from "@/app/server/services/fid.js";
import { handleRouteError, jsonWithCache, parseParams, parseQuery } from "@/app/server/http";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

const paramsSchema = z.object({ fid: fidSchema });

export const Route = createFileRoute("/api/farcaster/$fid/signers")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const { fid } = parseParams(params, paramsSchema);
          const query = parseQuery(request, farcasterFidQuerySchema);
          await ensureInitialized();
          const data = await getFidSigners(fid, {
            pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
            pageToken: query.pageToken,
            reverse: query.reverse === "true",
            signer: query.signer,
          });
          return jsonWithCache(data, CACHE_TTLS.LONG);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
