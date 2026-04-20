import { fidSchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getSignersEnriched } from "@/app/server/services/signer.js";
import { handleRouteError, jsonWithCache, parseQuery } from "@/app/server/http";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

const querySchema = z.object({ fid: fidSchema });

export const Route = createFileRoute("/api/signers/enriched")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { fid } = parseQuery(request, querySchema);
          await ensureInitialized();
          const data = await getSignersEnriched(fid);
          return jsonWithCache(data, CACHE_TTLS.LONG);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
