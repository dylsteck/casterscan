# Casterscan

A real-time block explorer for Farcaster.

Production: [casterscan.com](https://casterscan.com)

![Casterscan](https://i.imgur.com/ryRhP0P.png)

## Architecture

Casterscan now runs as one TanStack Start app (Vite + Nitro) with both UI routes and API routes in the same runtime.

```text
Browser → TanStack Start routes + /api/* server routes → upstream services (Neynar, Snapchain, Farcaster API, Optimism RPC)
```

Key notes:
- No separate `apps/web` + `apps/api` setup anymore.
- Public app routes remain the same (`/`, `/casts/$hash`, `/fids/$fid`, etc.).
- Public API surface is `/api/*` only.
- Package manager is `bun`.

## Local Development

1. Install dependencies:
   - `bun install`
2. Create env file:
   - `cp .env.example .env.local`
3. Set required env vars (`NEYNAR_API_KEY` at minimum).
4. Run dev server:
   - `bun run dev`
5. Build + run production output locally:
   - `bun run build`
   - `bun run start`

## Environment Variables

Required:
- `NEYNAR_API_KEY`: Neynar API key for user/cast lookups.

Optional:
- `REDIS_URL`: enables Redis caching.
- `BASE_URL`: canonical app URL used in metadata and frame URLs.
- `VITE_GOOGLE_ANALYTICS_ID`: Google Analytics ID.

## Deployment (Coolify + Nixpacks)

This repo includes a `nixpacks.toml` configured for a non-static TanStack Start Nitro deployment:
- install: `bun install --frozen-lockfile`
- build: `bun run build`
- start: `node .output/server/index.mjs`

Coolify should expose port `3000` (Nitro default when `PORT` is unset).

## Scripts

- `bun run dev` — run TanStack Start dev server on port `3000`.
- `bun run build` — build client + server (Nitro output in `.output/`).
- `bun run start` — start Nitro server.
- `bun run lint` — run ESLint.

## Contributing

Questions or ideas:
- [Message Dylan on Farcaster](https://farcaster.xyz/dylsteck.eth)
- [Open an issue](https://github.com/dylsteck/casterscan/issues/new)
