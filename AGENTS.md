# AGENTS.md — AI Agent Guide for Casterscan

This document gives working context for AI agents editing this repository.

## Project Overview

Casterscan is a real-time block explorer for Farcaster. It surfaces casts, users, signers, keys, and live events.

Production: [casterscan.com](https://casterscan.com)

## Current Architecture (Unified App)

Casterscan is a single TanStack Start app at repo root.

```text
Browser → TanStack Start UI routes + /api/* server routes → service layer → upstream APIs
```

There is no separate `apps/web` and `apps/api` runtime anymore.

### Stack

- TanStack Start (Vite + Nitro, Node runtime)
- React + TanStack Router + TanStack Query
- Server/business logic in `app/server/*`
- Zod contracts in `app/contracts/*`
- Bun package manager + lockfile

## Directory Map

| Path | Purpose |
|------|---------|
| `app/routes/*` | UI routes and server route handlers |
| `app/routes/api/*` | Public API endpoints (`/api/*`) |
| `app/server/*` | Services, cache, upstream clients, bootstrap/config |
| `app/contracts/*` | Shared API validation contracts (Zod) |
| `app/lib/*` | Shared app helpers and typed client/server wrappers |
| `public/*` | Static assets |
| `nixpacks.toml` | Coolify deployment build/start config |

## Public Routes

Preserve these page paths:
- `/`
- `/casts/$hash`
- `/fids/$fid`
- `/events/$id`
- `/usernames/$username`
- `/share-cast`
- `/.well-known/farcaster.json`

## Public API Surface

Public API is `/api/*` only.

Primary endpoints used by UI:
- `/api/snapchain/info`
- `/api/snapchain/event`
- `/api/snapchain/cast`
- `/api/events` (SSE stream)
- `/api/fid/$fid/stats`
- `/api/signers/enriched`
- `/api/signers/messages`
- `/api/signers/stats`
- `/api/farcaster/$fid/signers`
- `/api/farcaster/$fid/casts`
- `/api/farcaster/$fid/keys`
- `/api/farcaster/$fid/links`
- `/api/farcaster/$fid/reactions`
- `/api/farcaster/$fid/verifications`
- `/api/farcaster/user`
- `/api/farcaster/cast`
- `/api/neynar/user`
- `/api/neynar/cast`

Do not reintroduce `/v1/*` as a public app API.

## Validation and Typing

- Keep request validation at route boundaries via Zod.
- Keep response validation for typed route output where contracts exist.
- Prefer shared contracts from `app/contracts/api.ts` over duplicated local types.
- Preserve existing response shapes expected by frontend consumers.

## Env Vars

| Var | Required | Description |
|-----|----------|-------------|
| `NEYNAR_API_KEY` | Yes | Neynar API key for cast/user lookups |
| `REDIS_URL` | No | Redis cache backend (cache falls back when unset) |
| `BASE_URL` | No | Canonical base URL used for metadata/frames |
| `VITE_GOOGLE_ANALYTICS_ID` | No | Client analytics ID |
| `GOOGLE_ANALYTICS_ID` | No | Server-side analytics ID fallback |

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Local dev server on `:3000` |
| `bun run build` | Build TanStack Start + Nitro output |
| `bun run start` | Run Nitro output (`node .output/server/index.mjs`) |
| `bun run lint` | ESLint |

## Deployment (Coolify)

- Deploy as a non-static Node app.
- Nixpacks config is in `nixpacks.toml`.
- Build output is `.output/*`.
- Start command is `node .output/server/index.mjs`.
- Expected app port is `3000` (or `PORT` if provided by platform).

## Design System Notes

- Preserve current boxy minimal aesthetic.
- Keep black borders (`border border-black`) and existing typography/layout choices.
- Keep mobile-first responsive behavior.

## Implementation Rules

1. Use `bun` only (no npm/yarn).
2. Preserve public route paths and API response compatibility.
3. Keep API handlers in `app/routes/api/*`, business logic in `app/server/*`.
4. Keep filename style kebab-case for new files.
5. Prefer incremental, contract-safe changes over broad rewrites.
