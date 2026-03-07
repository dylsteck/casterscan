import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { healthRoutes } from "./routes/health";
import { fidsRoutes } from "./routes/fids";
import { signersRoutes } from "./routes/signers";
import { usersRoutes } from "./routes/users";
import { castsRoutes } from "./routes/casts";
import { keysRoutes } from "./routes/keys";
import { snapchainRoutes } from "./routes/snapchain";
import { NotFoundError, UpstreamError } from "./lib/errors";

export const app = new Elysia()
  .use(cors())
  .use(healthRoutes)
  .use(fidsRoutes)
  .use(signersRoutes)
  .use(usersRoutes)
  .use(castsRoutes)
  .use(keysRoutes)
  .use(snapchainRoutes)
  .onError(({ error }) => {
    if (error instanceof NotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (error instanceof UpstreamError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.status ?? 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  });
