# AGENTS.md — AI Agent Guide for Casterscan

This document provides in-depth context for AI agents working on the Casterscan codebase.

## Project Overview

Casterscan is a real-time block explorer for Farcaster. It surfaces Farcaster data (casts, users, signers, keys) via a unified API and Next.js frontend. Live events stream from the Snapchain node at `snap.farcaster.xyz:3383`.

**Production:** [casterscan.com](https://casterscan.com) | **API:** [api.casterscan.com](https://api.casterscan.com)

---

## Architecture

```
Browser → Next.js (apps/web) → Next.js API Routes (proxy) → apps/api (Express) → Upstream (Neynar, Snapchain, Farcaster API, Optimism RPC)
```

- **Frontend never calls the API directly.** All requests go through Next.js API routes, which use `apiFetch(API_URL + path)` in `apps/web/app/lib/api.ts`.
- **API base URL:** `http://localhost:4000` (dev) or `https://api.casterscan.com` (prod).
- API paths and response shapes must stay identical for the frontend to work without changes.

---

## Monorepo Layout

| Path | Purpose |
|------|---------|
| `apps/web` | Next.js app (pages, components, hooks, API proxy routes) |
| `apps/api` | Express REST API (services, routes, cache, upstream clients) |
| `packages/*` | Shared packages (if any) |

**Package manager:** `bun` only. Do not use npm or yarn.

---

## apps/web — Next.js App

### Key Paths

- `app/lib/api.ts` — `apiFetch()` wrapper; `API_URL` from env
- `app/lib/server.ts` — Server-side helpers (getNeynarUser, getNeynarCast, etc.)
- `app/hooks/` — `use-fid-stats.ts`, `use-signer-messages.ts`, `use-apps-with-signers.ts`, `use-info.ts`, `use-events.ts`, `use-api-data.ts`
- `app/components/custom/` — App-specific components
- `app/components/ui/` — Shadcn/ui components only
- `app/api/` — Next.js API routes that proxy to `apps/api`

### API Proxy Mapping

| Next.js route | Proxies to |
|---------------|------------|
| `/api/snapchain/info` | `GET /v1/snapchain/info` |
| `/api/snapchain/event` | `GET /v1/snapchain/events/:eventId` |
| `/api/snapchain/cast` | `GET /v1/casts/:hash` |
| `/api/fid/[fid]/stats` | `GET /v1/fids/:fid/stats` |
| `/api/signers/enriched` | `GET /v1/fids/:fid/signers/enriched` |
| `/api/signers/messages` | `GET /v1/fids/:fid/signers/:signerKey/messages` |
| `/api/signers/stats` | `GET /v1/fids/:fid/signers/:signerKey/stats` |
| `/api/farcaster/[fid]/signers` | `GET /v1/fids/:fid/signers` |
| `/api/farcaster/[fid]/casts` | `GET /v1/fids/:fid/messages` |
| `/api/farcaster/[fid]/keys` | `GET /v1/fids/:fid/keys` |
| `/api/farcaster/user`, `/api/neynar/user` | `GET /v1/users/:fid` |
| `/api/farcaster/cast`, `/api/neynar/cast` | `GET /v1/casts/:hash` |
| `lib/server.ts` (by-username) | `GET /v1/users/by-username/:username` |
| `lib/server.ts` (bulk) | `POST /v1/users/bulk` |

### Conventions

- File naming: kebab-case (e.g. `live-feed.tsx`, `use-event-stream.ts`)
- Prefer named exports for components
- Use `'use client'` for client components
- Use relative paths for local imports

---

## apps/api — Express REST API

### Key Paths

- `src/app.ts` — Express app, CORS, middleware, router mounting
- `src/index.ts` — Default export for Vercel
- `src/server.ts` — Local dev server (`app.listen` when not on Vercel)
- `src/bootstrap.ts` — `ensureInitialized()`, config, Redis, upstream init
- `src/config.ts` — Env validation (Zod)
- `src/routes/` — Express routers (health, snapchain, fids, signers, keys, users, casts)
- `src/services/` — Business logic (snapchain, fid, signer, keys, user, cast)
- `src/cache/` — Redis client, cache keys, TTLs, coalescing
- `src/upstream/` — Neynar, Snapchain, Farcaster API, Optimism RPC clients
- `src/lib/validate.ts` — Zod validation middleware (`validateParams`, `validateQuery`, `validateBody`, `asyncHandler`)
- `src/lib/errors.ts` — `NotFoundError`, `UpstreamError`

### Router Mount Order (Important)

Express matches routes in declaration order. More specific paths must come first:

1. `app.use("/", healthRouter)` — `/health`, `/ping`
2. `app.use("/v1/snapchain", snapchainRouter)`
3. `app.use("/v1/users", usersRouter)` — `/by-username/:username` and `/bulk` before `/:fid`
4. `app.use("/v1/casts", castsRouter)`
5. `app.use("/v1/fids", signersRouter)` — before fids so `/signers/enriched` matches
6. `app.use("/v1/fids", keysRouter)`
7. `app.use("/v1/fids", fidsRouter)`

### ESM / Node.js

- All relative imports must use `.js` extensions (e.g. `./lib/errors.js`) for Node ESM compatibility on Vercel.
- TypeScript resolves `.js` to `.ts` at compile time.

### Validation

- Use `validateParams`, `validateQuery`, `validateBody` from `lib/validate.ts`.
- Wrap async handlers with `asyncHandler` so thrown errors reach the error handler.

### Deployment

- **Local:** `bun run dev:api` or `bun run dev` from root.

### Vercel deploys

| App | CWD | Command | Target |
|-----|-----|---------|--------|
| Web | repo root | `vercel deploy --prod` | casterscan.com |
| API | `apps/api` | `vercel deploy --prod` | api.casterscan.com |

Omit `--prod` for preview deployments.

---

## Env Vars

| Var | App | Required | Description |
|-----|-----|----------|-------------|
| `NEYNAR_API_KEY` | api | Yes | Neynar API key for user/cast lookups |
| `API_URL` | web | No | API base URL (default: localhost:4000 dev, api.casterscan.com prod) |
| `REDIS_URL` | api | No | Redis URL; cache disabled if unset |

---

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Web + API in parallel (ports 3000, 4000) |
| `bun run dev:web` | Web only |
| `bun run dev:api` | API only |
| `bun run build` | Build both apps |
| `bun run start` | Start web (after build) |
| `bun run lint` | Lint |

---

## Design System (Web)

- Boxy, minimal design with black borders (`border border-black`)
- Shadcn/ui where needed; prefer custom components for consistency
- Monospace fonts for technical data (hashes, addresses, keys)
- Skeleton loading with shimmer
- Mobile-first, responsive

---

## Farcaster / Snapchain

- Snapchain gRPC: `snap.farcaster.xyz:3383`
- Snapchain REST: `snap.farcaster.xyz:3381/v1/`
- Cast messages: type 1 in the protocol
- FIDs: Farcaster user IDs

---

## When Making Changes

1. **API contract:** Preserve path and response shapes; frontend depends on them.
2. **Package manager:** Use `bun` only.
3. **File naming:** kebab-case.
4. **API imports:** Use `.js` extensions in `apps/api`.
5. **Router order:** Keep signers before fids; `/by-username` and `/bulk` before `/:fid` in users.
