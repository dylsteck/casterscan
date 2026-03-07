/**
 * Elysia entrypoint for Vercel.
 * We use Node.js runtime instead of Bun (no bunVersion in vercel.json) because
 * Bun has a known bug on Vercel: "Requested module is not instantiated yet"
 * when loading complex dependency graphs. See:
 * https://community.vercel.com/t/bun-runtime-requested-module-is-not-instantiated-yet/26380
 * Elysia supports both runtimes: https://elysiajs.com/integrations/vercel
 */
import { app } from "./app";

export default app;
