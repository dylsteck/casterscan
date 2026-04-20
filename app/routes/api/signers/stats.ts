import { signerStatsQuerySchema, signerStatsResponseSchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getSignerStats } from "@/app/server/services/signer.js";
import { handleRouteError, jsonWithCache, parseQuery } from "@/app/server/http";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/signers/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { fid, signer } = parseQuery(request, signerStatsQuerySchema);
          await ensureInitialized();
          const data = signerStatsResponseSchema.parse(await getSignerStats(fid, signer));
          return jsonWithCache(data, CACHE_TTLS.FIFTEEN_MIN);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
