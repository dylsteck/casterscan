import { neynarCastQuerySchema, neynarCastResponseSchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getCast } from "@/app/server/services/cast.js";
import { handleRouteError, jsonWithCache, parseQuery } from "@/app/server/http";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/neynar/cast")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { identifier, type } = parseQuery(request, neynarCastQuerySchema);
          const hash = type === "hash" ? identifier : identifier.match(/0x[a-fA-F0-9]+/)?.[0];
          if (!hash) {
            return Response.json({ error: "Could not extract hash from identifier" }, { status: 400 });
          }

          await ensureInitialized();
          const cast = neynarCastResponseSchema.parse(await getCast(hash));
          return jsonWithCache({ cast }, CACHE_TTLS.LONG);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
