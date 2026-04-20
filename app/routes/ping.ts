import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ping")({
  server: {
    handlers: {
      GET: async () => Response.json({ ok: true }),
    },
  },
});
