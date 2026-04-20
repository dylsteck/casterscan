import { ZodError, type ZodSchema } from "zod";
import { NotFoundError, UpstreamError } from "@/app/server/lib/errors.js";

export function parseQuery<T>(request: Request, schema: ZodSchema<T>): T {
  const url = new URL(request.url);
  const input = Object.fromEntries(url.searchParams.entries());
  return schema.parse(input);
}

export function parseParams<T>(params: unknown, schema: ZodSchema<T>): T {
  return schema.parse(params);
}

export function jsonWithCache(value: unknown, maxAge: number): Response {
  return Response.json(value, {
    headers: {
      "Cache-Control": `max-age=${maxAge}`,
    },
  });
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof NotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof UpstreamError) {
    const message = process.env.NODE_ENV === "production" ? "Upstream service error" : error.message;
    return Response.json({ error: message }, { status: error.status ?? 502 });
  }

  return Response.json({ error: "Internal error" }, { status: 500 });
}
