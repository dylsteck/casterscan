import type { Request, Response, RequestHandler } from "express";
import { Effect } from "effect";
import { runAppEffect } from "./runtime.js";

export function effectHandler<A, E, R>(
  handler: (req: Request, res: Response) => Effect.Effect<A, E, R>
): RequestHandler {
  return (req, res, next) => {
    void runAppEffect(handler(req, res)).catch(next);
  };
}

export function effectJson<A, E, R>(
  handler: (req: Request, res: Response) => Effect.Effect<A, E, R>
): RequestHandler {
  return effectHandler((req, res) =>
    Effect.tap(handler(req, res), (data) =>
      Effect.sync(() => {
        if (!res.headersSent) {
          res.json(data);
        }
      })
    )
  );
}
