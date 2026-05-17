# Casterscan

A real-time block explorer for Farcaster.

Production: [casterscan.com](https://casterscan.com)

![Casterscan](https://i.imgur.com/ryRhP0P.png)

## Architecture

Casterscan now runs as one TanStack Start app (Vite + Nitro) with both UI routes and API routes in the same runtime.

```text
Browser → TanStack Start routes + /api/* server routes → upstream services (Hypersnap, Snapchain, Farcaster API, Optimism RPC)
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
3. Run dev server:
   - `bun run dev`
4. Build + run production output locally:
   - `bun run build`
   - `bun run start`

## Environment Variables

User and cast enrichment calls the public Hypersnap mirror at `https://haatz.quilibrium.com` from the server; no API key is required for that.

Optional:
- `REDIS_URL`: enables Redis caching.
- `BASE_URL`: canonical app URL used in metadata and frame URLs.
- `VITE_GOOGLE_ANALYTICS_ID`: Google Analytics ID.

## Deployment (Docker / Coolify)

The root **`Dockerfile`** builds a production image (Bun installs and runs `bun run build`, then Node Alpine runs `node .output/server/index.mjs`). Point Coolify (or any Docker host) at that Dockerfile and expose port **3000** (or set `PORT` per your platform).

## Scripts

- `bun run dev` — run TanStack Start dev server on port `3000`.
- `bun run build` — build client + server (Nitro output in `.output/`).
- `bun run start` — start Nitro server.
- `bun run lint` — run ESLint.

## Contributing

Questions or ideas:
- [Message Dylan on Farcaster](https://farcaster.xyz/dylsteck.eth)
- [Open an issue](https://github.com/dylsteck/casterscan/issues/new)
