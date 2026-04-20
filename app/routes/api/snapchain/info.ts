import { infoResponseSchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getInfo } from "@/app/server/services/snapchain.js";
import { handleRouteError, jsonWithCache } from "@/app/server/http";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/snapchain/info")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await ensureInitialized();
          const data = infoResponseSchema.parse(await getInfo());
          return jsonWithCache(data, CACHE_TTLS.SHORT);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
