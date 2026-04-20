import { snapchainCastQuerySchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getCastFormat } from "@/app/server/services/cast.js";
import { handleRouteError, jsonWithCache, parseQuery } from "@/app/server/http";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/snapchain/cast")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { fid, hash, type } = parseQuery(request, snapchainCastQuerySchema);
          await ensureInitialized();
          const format = type === "neynar" ? "neynar-hub" : "farcaster-hub";
          const data = await getCastFormat(fid, hash, format);
          return jsonWithCache(data, CACHE_TTLS.LONG);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
