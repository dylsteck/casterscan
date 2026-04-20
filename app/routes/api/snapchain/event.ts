import { eventRouteQuerySchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getEvent } from "@/app/server/services/snapchain.js";
import { handleRouteError, jsonWithCache, parseQuery } from "@/app/server/http";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/snapchain/event")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { event_id, shard_index } = parseQuery(request, eventRouteQuerySchema);
          await ensureInitialized();
          const data = await getEvent(event_id, shard_index ?? "0");
          return jsonWithCache(data, CACHE_TTLS.FIFTEEN_MIN);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
