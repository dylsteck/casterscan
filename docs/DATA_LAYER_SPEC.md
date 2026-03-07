# Farcaster Data Layer — Monorepo Implementation Spec

**Context:** Add a standalone data layer server to the Casterscan repo as a monorepo package. Same repo, new `packages/data-layer` with Redis cache, request coalescing, and a clean REST API that the Next.js app consumes.

---

## 0. Framework Choice: Elysia vs Hono

| Criterion | Elysia | Hono |
|-----------|--------|------|
| **Runtime** | Bun-first (optimized) | Multi-runtime (Node, Deno, Bun, Workers, Lambda) |
| **Performance on Bun** | ~20–40% faster in benchmarks | Slightly slower, still very fast |
| **Type safety** | Eden Treaty: end-to-end types, no codegen | RPC mode exists, less mature |
| **Bun lock-in** | Yes | No — can switch to Node if needed |
| **Middleware ecosystem** | Plugin-based, type-safe | Broader (JWT, CORS, rate limit, etc.) |
| **Learning curve** | Easy | Easy |
| **Client generation** | `treaty<App>(url)` — full type inference | Manual or `hono/client` |

**Recommendation: Elysia**

- You already use Bun. Elysia is built for it.
- Eden Treaty gives you a typed client in the Next.js app: `treaty<App>(DATA_LAYER_URL).v1.users[123].get()` — no manual fetch wrappers.
- Slightly better performance and DX for this use case.
- Tradeoff: if you ever need to run the data layer on Node (e.g. a Lambda), you’d need to switch frameworks. For a long-lived server (Railway, Fly.io), Bun is fine.

**If you prefer Hono:** Use it. You can run on Node or Bun, and the rest of this spec applies. The route structure and cache logic are framework-agnostic.

---

## 1. Monorepo Structure

```
casterscan/
├── package.json              # Root workspace config
├── turbo.json                # (optional) Turborepo config
├── apps/
│   └── web/                  # Current Next.js app (moved)
│       ├── app/
│       ├── package.json
│       └── ...
├── packages/
│   └── data-layer/           # New data layer server
│       ├── src/
│       ├── package.json
│       └── ...
└── docs/
    └── DATA_LAYER_SPEC.md
```

**Alternative (simpler):** Keep Next.js at root, add `packages/data-layer` only:

```
casterscan/
├── app/                      # Next.js (unchanged location)
├── packages/
│   └── data-layer/
└── package.json              # Workspace root
```

**Recommendation:** Use the simpler layout. Move to `apps/web` only if you expect more apps (e.g. mobile, admin dashboard).

---

## 2. Workspace Setup

**Root `package.json`:**

```json
{
  "name": "casterscan",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "bun run --filter web dev",
    "dev:data-layer": "bun run --filter data-layer dev",
    "dev:all": "concurrently \"bun run dev\" \"bun run dev:data-layer\"",
    "build": "bun run --filter web build",
    "build:data-layer": "bun run --filter data-layer build"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

If you keep Next.js at root (no `apps/web`), adjust:

```json
{
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "next dev",
    "dev:data-layer": "bun run --cwd packages/data-layer dev",
    "dev:all": "concurrently \"bun run dev\" \"bun run dev:data-layer\""
  }
}
```

---

## 3. Data Layer Package Structure

```
packages/data-layer/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Entry point, starts server
│   ├── app.ts                 # Elysia app (exported for Eden Treaty)
│   ├── config.ts             # Env vars, Redis URL, etc.
│   │
│   ├── cache/
│   │   ├── redis.ts          # Redis client + helpers
│   │   ├── keys.ts            # Cache key builders
│   │   └── coalesce.ts       # In-flight request coalescing
│   │
│   ├── upstream/             # Data source clients
│   │   ├── neynar.ts
│   │   ├── snapchain.ts
│   │   ├── farcaster.ts
│   │   └── keys.ts           # Optimism Key Registry
│   │
│   ├── routes/
│   │   ├── user.ts
│   │   ├── cast.ts
│   │   ├── fid.ts
│   │   └── signers.ts
│   │
│   └── types/
│       └── index.ts
└── README.md
```

---

## 4. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Runtime | Bun | Matches Elysia, fast startup |
| HTTP | Elysia (or Hono) | Bun-native, Eden Treaty for typed client |
| Cache | Redis (ioredis or @upstash/redis) | Shared cache, TTL, coalescing |
| Package manager | Bun | Already in use |

**Dependencies (`packages/data-layer/package.json`):**

```json
{
  "name": "data-layer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build src/index.ts --outdir=dist --target=bun",
    "start": "bun run dist/index.js",
    "test": "bun test"
  },
  "dependencies": {
    "elysia": "^1.1.0",
    "@elysiajs/cors": "^1.1.0",
    "ioredis": "^5.4.0",
    "viem": "^2.37.9",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  }
}
```

Use `@upstash/redis` instead of `ioredis` if you want serverless-friendly Redis (e.g. edge deployment).

---

## 5. API Surface

Base URL: `http://localhost:4000` (or `DATA_LAYER_URL` env)

### Users

| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `/v1/users/:fid` | User by FID (Neynar) | 1 hr |
| GET | `/v1/users/by-username/:username` | User by username | 1 hr |
| POST | `/v1/users/bulk` | Body: `{ fids: string[] }` | 1 hr per FID |

### Casts

| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `/v1/casts/:hash` | Enriched cast (Neynar) | 1 hr |
| GET | `/v1/casts/:hash?format=neynar-hub` | Neynar Hub raw | 1 hr |
| GET | `/v1/casts/:hash?format=farcaster-hub` | Snapchain raw | 1 hr |
| GET | `/v1/casts/:hash?format=farcaster-api` | Farcaster API thread | 1 hr |

### FID-Scoped

| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `/v1/fids/:fid/stats` | `{ casts, reactions, links, verifications }` | 1 hr |
| GET | `/v1/fids/:fid/messages` | All messages (casts, reactions, links, verifications) | 15 min |
| GET | `/v1/fids/:fid/signers` | On-chain signers | 1 hr |
| GET | `/v1/fids/:fid/keys` | Auth addresses + signer keys (Optimism) | 1 hr |

### Signers (Aggregate)

| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `/v1/fids/:fid/signers/enriched` | Signers + message stats + app profiles | 15 min |
| GET | `/v1/fids/:fid/signers/:signerKey/messages` | Messages filtered by signer | 15 min |
| GET | `/v1/fids/:fid/signers/:signerKey/stats` | `{ casts, reactions, links, verifications, lastUsed }` | 15 min |

### Misc

| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `/v1/snapchain/info` | Snapchain node info | 5 min |
| GET | `/v1/snapchain/events/:eventId` | Event by ID | 1 hr |

---

## 6. Redis Cache Design

### Cache Keys

```
user:{fid}
user:username:{username}
cast:{hash}
cast:{hash}:neynar-hub
cast:{hash}:farcaster-hub
cast:{hash}:farcaster-api
fid:{fid}:messages          # { casts, reactions, links, verifications }
fid:{fid}:stats             # { casts, reactions, links, verifications } (counts only)
fid:{fid}:signers
fid:{fid}:signers:enriched
fid:{fid}:signers:{signer}:messages
fid:{fid}:signers:{signer}:stats
fid:{fid}:keys
users:bulk:{sortedFids}     # Bulk user response keyed by sorted comma-joined FIDs
snapchain:info
snapchain:event:{eventId}:{shardIndex}
```

### TTLs

| Key Pattern | TTL | Reason |
|-------------|-----|--------|
| `user:*`, `cast:*`, `fid:*:signers`, `fid:*:keys` | 3600 (1 hr) | Relatively stable |
| `fid:*:messages`, `fid:*:signers:enriched`, `*:signer:*` | 900 (15 min) | Messages change frequently |
| `fid:*:stats` | 900 (15 min) | Derived from messages |
| `snapchain:info` | 300 (5 min) | Live feed stats |

### Request Coalescing

For identical in-flight requests, return a single upstream call:

```ts
// Pseudocode
const coalesce = new Map<string, Promise<unknown>>();

async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  if (coalesce.has(key)) {
    return coalesce.get(key) as Promise<T>;
  }

  const promise = fetcher()
    .then(async (data) => {
      await redis.setex(key, TTL, JSON.stringify(data));
      coalesce.delete(key);
      return data;
    })
    .catch((err) => {
      coalesce.delete(key);
      throw err;
    });

  coalesce.set(key, promise);
  return promise;
}
```

---

## 7. Data Flow (High Level)

```
Next.js app
    │
    │  fetch(DATA_LAYER_URL + '/v1/user/123')
    │  fetch(DATA_LAYER_URL + '/v1/fids/123/keys')
    │  fetch(DATA_LAYER_URL + '/v1/fids/123/signers/enriched')
    ▼
┌─────────────────────────────────────────────────────────┐
│  Data Layer (Elysia server)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Redis cache │  │ Coalescing  │  │ Upstream clients │  │
│  │ (hit/miss)  │  │ (dedup)     │  │ Neynar, Snapchain│  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Neynar, Snapchain, Farcaster API, Optimism
```

---

## 8. Frontend Migration

### Env

```env
NEXT_PUBLIC_DATA_LAYER_URL=http://localhost:4000
```

### New lib client

```ts
// app/lib/data-layer.ts
const BASE = process.env.NEXT_PUBLIC_DATA_LAYER_URL || '';

export async function dataLayerFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Data layer error: ${res.status}`);
  return res.json();
}
```

### Hook changes

| Current | New |
|---------|-----|
| `getNeynarUser(fid)` | `dataLayerFetch('/v1/users/' + fid)` |
| `getFarcasterKeys(fid)` | `dataLayerFetch('/v1/fids/' + fid + '/keys')` |
| `useAppsWithSigners` → `/api/signers/enriched` | `dataLayerFetch('/v1/fids/' + fid + '/signers/enriched')` |
| `useFidStats` → 4 fetches | `dataLayerFetch('/v1/fids/' + fid + '/stats')` |
| `useSignerMessages` → snapchain | `dataLayerFetch('/v1/fids/' + fid + '/signers/' + signer + '/messages')` |

### Next.js API routes

Two options:

1. **Direct proxy:** Next.js API routes become thin wrappers that call the data layer and return. Keeps existing URLs (`/api/farcaster/...`) for minimal frontend changes.
2. **Frontend calls data layer directly:** Remove most Next.js API routes; frontend calls `DATA_LAYER_URL` from server components and client. Simpler, but requires CORS on the data layer.

**Recommendation:** Use (1) for now. Next.js API routes proxy to the data layer. That way:
- No CORS on data layer
- Same-origin requests from frontend
- Existing `/api/...` URLs stay stable

---

## 9. Code to Extract / Reuse

Move into `packages/data-layer` (or import from a shared package):

- `lib/neynar/` → `packages/data-layer/src/upstream/neynar.ts`
- `lib/snapchain/` → `packages/data-layer/src/upstream/snapchain.ts`
- `lib/farcaster/` → `packages/data-layer/src/upstream/farcaster.ts`
- `lib/farcaster/keys.ts` → `packages/data-layer/src/upstream/keys.ts`

Keep in Next.js app:

- `lib/axiom/` (logging)
- `lib/types.ts` (shared types can move to `packages/data-layer` or `packages/shared` if needed)

---

## 10. Deployment

### Local dev

```bash
# Terminal 1: Redis (Docker)
docker run -d -p 6379:6379 redis:alpine

# Terminal 2: Data layer
bun run dev:data-layer

# Terminal 3: Next.js
bun run dev
```

### Vercel + Railway / Fly / Render

- **Next.js:** Deploy to Vercel (unchanged)
- **Data layer:** Deploy to Railway, Fly.io, or Render as a Node service
- **Redis:** Upstash (serverless) or Redis Cloud (managed)

### Env

**Data layer:**

```
REDIS_URL=redis://localhost:6379
NEYNAR_API_KEY=...
SNAPCHAIN_URL=https://snap.farcaster.xyz:3381
FARCASTER_API_URL=https://api.farcaster.xyz
OPTIMISM_RPC_URL=https://mainnet.optimism.io
PORT=4000
```

**Next.js:**

```
DATA_LAYER_URL=https://data-layer.yourapp.railway.app
```

---

## 11. Migration Phases

### Phase 1: Add package, no migration yet

1. Create `packages/data-layer` with Hono + Redis
2. Implement `/v1/fids/:fid/stats` and `/v1/fids/:fid/messages`
3. Add Next.js route `/api/fid/[fid]/stats` that proxies to data layer
4. Switch `useFidStats` to use new route
5. Validate: same behavior, fewer upstream calls

### Phase 2: Signers

1. Implement `/v1/fids/:fid/signers/enriched` and `/v1/fids/:fid/signers/:signer/messages`
2. Add `/api/signers/messages` (proxy)
3. Switch `useAppsWithSigners` and `useSignerMessages` to data layer
4. Remove `/api/signers/stats` (or proxy)

### Phase 3: Users and casts

1. Implement `/v1/users/:fid`, `/v1/users/by-username/:username`, `/v1/casts/:hash`
2. Update `lib/server.ts` to call data layer instead of Neynar directly
3. Update cast details page to use data layer for hub/API formats

### Phase 4: Cleanup

1. Remove old API routes that are fully replaced
2. Remove or deprecate direct Neynar/Snapchain usage from Next.js
3. Document the data layer API

---

## 12. Optional: Shared Package

If you want shared types between Next.js and the data layer:

```
packages/
├── data-layer/
├── shared/
│   ├── package.json
│   └── src/
│       ├── types.ts
│       └── index.ts
```

`packages/shared` exports `NeynarV2User`, `NeynarV2Cast`, etc. Both `data-layer` and `web` depend on it. Skip this until you need it.

---

## 13. Detailed Task Breakdown

### Phase 1: Scaffolding (Tasks 1–8)

| # | Task | Est. | Notes |
|---|------|------|-------|
| 1 | Add `workspaces: ["packages/*"]` to root `package.json` | 5m | |
| 2 | Create `packages/data-layer/` with `package.json`, `tsconfig.json` | 15m | |
| 3 | Implement `src/config.ts` — env validation with Zod | 30m | Fail fast on missing vars |
| 4 | Implement `src/cache/redis.ts` — Redis client, `get`/`set`/`setex` helpers | 45m | Graceful fallback if Redis down |
| 5 | Implement `src/cache/keys.ts` — cache key builders (e.g. `cacheKeys.user(fid)`) | 20m | Single source of truth for keys |
| 6 | Implement `src/cache/coalesce.ts` — in-flight request deduplication | 45m | Map<key, Promise>, cleanup on settle |
| 7 | Implement `src/index.ts` — Elysia app, CORS, health route | 30m | `GET /health` returns `{ ok, redis }` |
| 8 | Add `dev:data-layer` and `dev:all` scripts to root | 10m | |

### Phase 2: Upstream Clients (Tasks 9–14)

| # | Task | Est. | Notes |
|---|------|------|-------|
| 9 | Port `lib/neynar/` → `src/upstream/neynar.ts` | 1h | Remove Next.js `next.revalidate`, pure fetch |
| 10 | Port `lib/snapchain/` → `src/upstream/snapchain.ts` | 1h | Same |
| 11 | Port `lib/farcaster/` → `src/upstream/farcaster.ts` | 30m | |
| 12 | Port `lib/farcaster/keys.ts` → `src/upstream/keys.ts` | 30m | Uses viem, Optimism RPC |
| 13 | Create `src/upstream/index.ts` — factory that injects config | 15m | Single place to instantiate clients |
| 14 | Add error types: `UpstreamError`, `CacheError`, `NotFoundError` | 30m | Consistent error shape for routes |

### Phase 3: FID Stats & Messages (Tasks 15–20)

| # | Task | Est. | Notes |
|---|------|------|-------|
| 15 | Implement `GET /v1/fids/:fid/stats` | 1h | Cache `fid:{fid}:stats`, TTL 900 |
| 16 | Implement `GET /v1/fids/:fid/messages` | 1.5h | Paginate Snapchain, merge, cache |
| 17 | Add Next.js proxy `/api/fid/[fid]/stats` | 15m | |
| 18 | Migrate `useFidStats` to use new route | 30m | |
| 19 | Add `/api/signers/messages` proxy | 15m | |
| 20 | Migrate `useSignerMessages` to proxy (client-side) | 45m | Filter by signer in data layer |

### Phase 4: Signers Enriched (Tasks 21–25)

| # | Task | Est. | Notes |
|---|------|------|-------|
| 21 | Implement `GET /v1/fids/:fid/signers/enriched` | 2h | Port logic from `/api/signers/enriched` |
| 22 | Implement `GET /v1/fids/:fid/signers/:signer/messages` | 1h | Reuse messages, filter by signer |
| 23 | Implement `GET /v1/fids/:fid/signers/:signer/stats` | 45m | |
| 24 | Add Next.js proxies for signers | 30m | |
| 25 | Migrate `useAppsWithSigners` → data layer | 45m | |

### Phase 5: Users & Casts (Tasks 26–32)

| # | Task | Est. | Notes |
|---|------|------|-------|
| 26 | Implement `GET /v1/users/:fid` | 45m | |
| 27 | Implement `GET /v1/users/by-username/:username` | 30m | |
| 28 | Implement `POST /v1/users/bulk` | 45m | Batch Neynar |
| 29 | Implement `GET /v1/casts/:hash` + `?format=` | 1h | |
| 30 | Implement `GET /v1/fids/:fid/keys` | 45m | |
| 31 | Update `lib/server.ts` to call data layer | 1h | |
| 32 | Update cast details page to use data layer for hub/API formats | 45m | |

### Phase 6: Cleanup & Polish (Tasks 33–38)

| # | Task | Est. | Notes |
|---|------|------|-------|
| 33 | Remove deprecated Next.js API routes | 30m | |
| 34 | Add request logging middleware | 30m | Path, method, duration, status |
| 35 | Add OpenAPI spec (or Elysia’s built-in) | 45m | |
| 36 | Write README for data-layer package | 30m | |
| 37 | Add integration tests for critical paths | 2h | Stats, messages, enriched |
| 38 | Document env vars in `.env.example` | 15m | |

**Total estimated:** ~25–30 hours

---

## 14. In-Depth Code Structure

### 14.1 File Layout (Full)

```
packages/data-layer/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts                 # Entry: load config, create app, listen
│   ├── app.ts                   # Elysia app definition (exported for Eden)
│   ├── config.ts                # Env + validation
│   │
│   ├── cache/
│   │   ├── index.ts             # Re-exports
│   │   ├── redis.ts             # Redis client
│   │   ├── keys.ts              # Key builders
│   │   ├── coalesce.ts          # In-flight coalescing
│   │   └── cached.ts            # getCached<T>(key, ttl, fetcher) — main abstraction
│   │
│   ├── upstream/
│   │   ├── index.ts             # Factory
│   │   ├── neynar.ts
│   │   ├── snapchain.ts
│   │   ├── farcaster.ts
│   │   └── keys.ts
│   │
│   ├── routes/
│   │   ├── index.ts             # Mount all routes
│   │   ├── health.ts
│   │   ├── users.ts
│   │   ├── casts.ts
│   │   ├── fids.ts
│   │   └── signers.ts
│   │
│   ├── services/                # Business logic (separate from HTTP)
│   │   ├── user.ts
│   │   ├── cast.ts
│   │   ├── fid.ts
│   │   └── signer.ts
│   │
│   └── lib/
│       ├── errors.ts            # Error classes
│       └── logger.ts            # Simple logger
└── tests/
    ├── setup.ts
    └── integration/
        ├── stats.test.ts
        └── messages.test.ts
```

### 14.2 Config (`src/config.ts`)

```ts
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  REDIS_URL: z.string().url().optional(),
  NEYNAR_API_KEY: z.string().min(1),
  SNAPCHAIN_URL: z.string().url().default('https://snap.farcaster.xyz:3381'),
  FARCASTER_API_URL: z.string().url().default('https://api.farcaster.xyz'),
  OPTIMISM_RPC_URL: z.string().url().default('https://mainnet.optimism.io'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const parsed = configSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Config validation failed:', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
}
```

### 14.3 Cache Keys (`src/cache/keys.ts`)

```ts
export const cacheKeys = {
  user: (fid: string) => `user:${fid}`,
  userByUsername: (username: string) => `user:username:${username.toLowerCase()}`,
  usersBulk: (fids: string[]) => `users:bulk:${[...fids].sort().join(',')}`,
  cast: (hash: string, format?: string) =>
    format ? `cast:${hash}:${format}` : `cast:${hash}`,
  fidMessages: (fid: string) => `fid:${fid}:messages`,
  fidStats: (fid: string) => `fid:${fid}:stats`,
  fidSigners: (fid: string) => `fid:${fid}:signers`,
  fidSignersEnriched: (fid: string) => `fid:${fid}:signers:enriched`,
  fidSignerMessages: (fid: string, signer: string) =>
    `fid:${fid}:signers:${signer}:messages`,
  fidSignerStats: (fid: string, signer: string) =>
    `fid:${fid}:signers:${signer}:stats`,
  fidKeys: (fid: string) => `fid:${fid}:keys`,
  snapchainInfo: () => 'snapchain:info',
  snapchainEvent: (eventId: string, shardIndex: string) =>
    `snapchain:event:${eventId}:${shardIndex}`,
} as const;

export const cacheTTL = {
  user: 3600,
  cast: 3600,
  fidMessages: 900,
  fidStats: 900,
  fidSigners: 3600,
  fidSignersEnriched: 900,
  fidSignerMessages: 900,
  fidSignerStats: 900,
  fidKeys: 3600,
  snapchainInfo: 300,
  snapchainEvent: 3600,
} as const;
```

### 14.4 Cached Fetcher (`src/cache/cached.ts`)

```ts
import { redis } from './redis';
import { coalesce } from './coalesce';

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // 1. Try cache (skip if Redis unavailable)
  const cached = redis ? await redis.get(key) : null;
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      return fetcher();
    }
  }

  // 2. Coalesce: if same key in flight, wait for it
  return coalesce.get(key, async () => {
    const data = await fetcher();
    if (redis) await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  });
}
```

**Graceful degradation:** If `REDIS_URL` is unset or Redis is down, `redis` is `null` and all requests go straight to upstream. Coalescing still works (in-memory).

### 14.4a Redis Client (`src/cache/redis.ts`)

```ts
import Redis from 'ioredis';

export let redis: Redis | null = null;

export async function initRedis(url?: string): Promise<void> {
  if (!url) {
    console.warn('REDIS_URL not set — cache disabled');
    return;
  }
  redis = new Redis(url);
  redis.on('error', (err) => console.error('Redis error:', err));
  redis.on('connect', () => console.log('Redis connected'));
}
```

### 14.5 Coalescing (`src/cache/coalesce.ts`)

```ts
const inFlight = new Map<string, Promise<unknown>>();

export const coalesce = {
  get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetcher().finally(() => {
      inFlight.delete(key);
    });
    inFlight.set(key, promise);
    return promise as Promise<T>;
  },
};
```

### 14.6 Service Layer (`src/services/fid.ts`)

Routes stay thin; services hold logic:

```ts
import { snapchain } from '../upstream';
import { getCached } from '../cache/cached';
import { cacheKeys, cacheTTL } from '../cache/keys';

export async function getFidStats(fid: string) {
  return getCached(
    cacheKeys.fidStats(fid),
    cacheTTL.fidStats,
    async () => {
      const [casts, reactions, links, verifications] = await Promise.all([
        snapchain.getCastsByFid({ fid, pageSize: 1000 }),
        snapchain.getReactionsByFid({ fid, pageSize: 1000, reaction_type: 'None' }),
        snapchain.getLinksByFid({ fid, pageSize: 1000 }),
        snapchain.getVerificationsByFid({ fid, pageSize: 1000 }),
      ]);
      return {
        casts: casts.messages?.length ?? 0,
        reactions: reactions.messages?.length ?? 0,
        links: links.messages?.length ?? 0,
        verifications: verifications.messages?.length ?? 0,
      };
    }
  );
}

export async function getFidMessages(fid: string) {
  return getCached(
    cacheKeys.fidMessages(fid),
    cacheTTL.fidMessages,
    async () => {
      const [casts, reactions, links, verifications] = await Promise.all([
        snapchain.getAllCastsByFid(fid),
        snapchain.getAllReactionsByFid(fid, 'None'),
        snapchain.getAllLinksByFid(fid),
        snapchain.getAllVerificationsByFid(fid),
      ]);
      return {
        casts,
        reactions,
        links,
        verifications,
      };
    }
  );
}
```

### 14.7 Route (`src/routes/fids.ts`)

```ts
import { Elysia, t } from 'elysia';
import { getFidStats, getFidMessages } from '../services/fid';

export const fidsRoutes = new Elysia({ prefix: '/v1/fids' })
  .get('/:fid/stats', async ({ params }) => {
    const { fid } = params;
    return getFidStats(fid);
  }, {
    params: t.Object({ fid: t.String() }),
  })
  .get('/:fid/messages', async ({ params }) => {
    const { fid } = params;
    return getFidMessages(fid);
  }, {
    params: t.Object({ fid: t.String() }),
  });
```

### 14.8 App Entry (`src/app.ts`)

```ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { healthRoutes } from './routes/health';
import { fidsRoutes } from './routes/fids';
import { usersRoutes } from './routes/users';
import { castsRoutes } from './routes/casts';
import { signersRoutes } from './routes/signers';

export const app = new Elysia()
  .use(cors())
  .use(healthRoutes)
  .use(usersRoutes)
  .use(castsRoutes)
  .use(fidsRoutes)
  .use(signersRoutes);
```

### 14.9 Index (`src/index.ts`)

```ts
import { loadConfig } from './config';
import { app } from './app';
import { initRedis } from './cache/redis';

async function main() {
  const config = loadConfig();
  await initRedis(config.REDIS_URL);

  app.listen(config.PORT);
  console.log(`Data layer listening on :${config.PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## 15. Cleanliness & Conventions

### 15.1 Layering

| Layer | Responsibility | Depends On |
|-------|-----------------|------------|
| **Routes** | HTTP: parse params, validate, call service, return JSON | Services |
| **Services** | Business logic: orchestrate upstream, shape response | Cache, Upstream |
| **Cache** | getCached, coalesce, Redis | Config |
| **Upstream** | Raw HTTP/RPC to Neynar, Snapchain, etc. | Config |

**Rule:** Routes never call upstream directly. Services never set HTTP status. Cache never knows about route shapes.

### 15.2 Error Handling

```ts
// src/lib/errors.ts
export class NotFoundError extends Error {
  constructor(public resource: string, public id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class UpstreamError extends Error {
  constructor(
    public source: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}
```

In Elysia, use `onError` to map these to HTTP responses:

```ts
app.onError(({ code, error }) => {
  if (error instanceof NotFoundError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (error instanceof UpstreamError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status ?? 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ error: 'Internal error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 15.3 Logging

- Log at service/cache boundaries: `logger.info('fid.stats', { fid, cacheHit })`
- Avoid logging in routes (noise)
- Use structured JSON for production (or keep Axiom if you add it later)

### 15.4 Testing

- **Unit:** Services with mocked upstream (e.g. `viem` mock for keys)
- **Integration:** Hit real Elysia server with test Redis; use `beforeAll`/`afterAll` to seed/clear
- **E2E:** Optional; run data layer + Next.js, hit `/api/fid/3/stats` and assert shape

### 15.5 Type Safety (Eden Treaty)

With Elysia, the Next.js app gets a fully typed client:

```ts
// In Next.js: app/lib/data-layer-client.ts
import { treaty } from '@elysiajs/eden';
import type { App } from 'data-layer';  // or workspace ref

const baseUrl = process.env.DATA_LAYER_URL!;
export const dataLayer = treaty<App>(baseUrl);

// Usage — full autocomplete and type inference:
const { data, error } = await dataLayer.v1.fids['3'].stats.get();
// data: { casts: number; reactions: number; links: number; verifications: number }
```

To enable this, the data-layer package must export its app type. Elysia infers it from the app definition.

- Use `t` (Elysia schema) for params/body validation so invalid input returns 400 before hitting services.

---

## 16. Summary

| Item | Detail |
|------|--------|
| Framework | Elysia (Bun-native, Eden Treaty for typed client) |
| Add | `packages/data-layer` with Redis, coalescing |
| Structure | Routes → Services → Cache/Upstream |
| API | REST `/v1/users`, `/v1/casts`, `/v1/fids/:fid/*` |
| Tasks | 38 tasks, ~25–30 hours |
| Cleanliness | Layered, typed errors, thin routes, fat services |
| Migration | Incremental, phase by phase |

This keeps everything in one repo and adds a clear, cacheable data layer with a maintainable structure.
