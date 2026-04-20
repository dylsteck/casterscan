import { fidSchema } from "@/app/contracts/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { ensureInitialized } from "@/app/server/bootstrap.js";
import { getFidMessages } from "@/app/server/services/fid.js";
import { handleRouteError, jsonWithCache, parseParams } from "@/app/server/http";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

const paramsSchema = z.object({ fid: fidSchema });

export const Route = createFileRoute("/api/farcaster/$fid/reactions")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { fid } = parseParams(params, paramsSchema);
          await ensureInitialized();
          const data = await getFidMessages(fid);
          return jsonWithCache({ messages: data.reactions }, CACHE_TTLS.FIFTEEN_MIN);
        } catch (error) {
          return handleRouteError(error);
        }
      },
    },
  },
});
