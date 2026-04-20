import { neynarUserResponseSchema, userQuerySchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getUser } from "@/app/server/services/user.js";
import { handleRouteError, jsonWithCache, parseQuery } from "@/app/server/http";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/farcaster/user")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { fid } = parseQuery(request, userQuerySchema);
          await ensureInitialized();
          const user = neynarUserResponseSchema.parse(await getUser(fid));
          return jsonWithCache(user, CACHE_TTLS.LONG);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
