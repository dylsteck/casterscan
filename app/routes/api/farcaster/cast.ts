import { castQuerySchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getCastFormat } from "@/app/server/services/cast.js";
import { handleRouteError, jsonWithCache, parseQuery } from "@/app/server/http";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/farcaster/cast")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { hash } = parseQuery(request, castQuerySchema);
          await ensureInitialized();
          const data = await getCastFormat("0", hash, "farcaster-api");
          return jsonWithCache(data, CACHE_TTLS.LONG);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
