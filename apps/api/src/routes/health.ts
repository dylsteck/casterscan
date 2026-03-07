import { Elysia } from "elysia";
import { redis } from "../cache/redis";

export const healthRoutes = new Elysia().get("/health", () => ({
  ok: true,
  redis: redis !== null,
}));
