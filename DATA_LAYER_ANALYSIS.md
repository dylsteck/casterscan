# Farcaster Data Layer Analysis

**Branch:** `data-layer-exploration`  
**Date:** March 7, 2025

## Executive Summary

After a deep dive through the Casterscan codebase, **yes—building a unified Farcaster data layer backend would be worthwhile**, but the payoff depends on scale and which pain points you prioritize. The current architecture has significant redundancy, scattered caching, and several "N+1" style patterns that a well-designed data service could consolidate.

---

## Current Data Sources (6 Distinct Systems)

| Source | Type | What It Provides | Used For |
|--------|------|------------------|----------|
| **Neynar API** (`api.neynar.com`) | REST | Enriched casts, users (bulk + by username) | Primary cast display, user profiles, app metadata |
| **Neynar Hub** (`snapchain-api.neynar.com`) | REST | Raw hub-format cast by fid+hash | Cast details "Neynar Hub" tab |
| **Snapchain** (`snap.farcaster.xyz:3381`) | REST | Casts, reactions, links, verifications, signers, events, info | FID stats, signer details, verifications, live feed metadata |
| **Farcaster API** (`api.farcaster.xyz`) | REST | User, cast (thread) | Cast details "Farcaster API" tab, user fallback |
| **Hub gRPC** (`snap.farcaster.xyz:3383`) | gRPC stream | Real-time MERGE_MESSAGE events | Live feed SSE |
| **Optimism** (Key Registry contract) | RPC | Auth addresses, signer keys for FID | Profile "addresses" tab |

---

## API Call Patterns (Where the Pain Is)

### 1. Profile Page Load (`/fids/[fid]` or `/usernames/[username]`)

**Server (parallel):**
- `getNeynarUser` or `getNeynarUserByUsername`
- `getFarcasterKeys` (Optimism RPC)

**Client (after hydration):**
- `useAppsWithSigners` → `/api/signers/enriched?fid=X`

**What `/api/signers/enriched` does internally:**
- 5 parallel Snapchain calls: `getOnChainSignersByFid`, `getAllCastsByFid`, `getAllReactionsByFid`, `getAllLinksByFid`, `getAllVerificationsByFid`
- Each `getAll*` paginates until exhausted (could be many round-trips for active users)
- Then `neynar.getUsers({ fids: [app FIDs] })` for app profiles

**Total:** 2 server + 1 API route that triggers 5+ Snapchain calls + 1 Neynar bulk call.

---

### 2. Cast Details Page (`/casts/[hash]`)

**Server:**
- `getNeynarCast(hash)` — primary display data

**Client (lazy, when user expands tabs):**
- `useFarcasterCast` → `/api/farcaster/cast?hash=X`
- `useNeynarHubCast` → `/api/snapchain/cast?type=neynar`
- `useFarcasterHubCast` → `/api/snapchain/cast?type=farcaster`

So **4 different representations** of the same cast are fetched from 3 different backends (Neynar API, Neynar Hub, Farcaster API, Snapchain). The Neynar API response is already in hand; the other 3 are fetched on-demand for the "raw data" tabs.

---

### 3. FID Stats (`useFidStats`)

**4 parallel fetches:**
- `/api/farcaster/[fid]/casts`
- `/api/farcaster/[fid]/reactions`
- `/api/farcaster/[fid]/links`
- `/api/farcaster/[fid]/verifications`

All hit Snapchain. Used in profile header for cast/reaction/link/verification counts.

---

### 4. Signer Detail (`useSignerMessages`)

**Client-side** (runs in browser):
- `snapchain.getAllCastsByFid(fid)`
- `snapchain.getAllReactionsByFid(fid)`
- `snapchain.getAllLinksByFid(fid)`
- `snapchain.getAllVerificationsByFid(fid)`

Each `getAll*` paginates (pageSize 1000) until done. For a user with 5k casts, that's 5+ requests to Snapchain **from the browser** (relies on Snapchain CORS).

**Same pattern** in `/api/signers/stats` (server-side): 4 parallel Snapchain calls with pageSize 1000.

---

### 5. Live Feed

- **SSE:** `/api/events` → gRPC subscribe to `snap.farcaster.xyz:3383` (MERGE_MESSAGE)
- **Stats:** `useInfo` → `/api/snapchain/info` (30s refresh)

---

## Redundancy & Overlap

| Data | Fetched From | Redundant? |
|------|--------------|------------|
| Cast by hash | Neynar API, Neynar Hub, Farcaster API, Snapchain | Yes — 4 sources for same logical entity |
| User by FID | Neynar, Farcaster API | Partial — different schemas, Neynar primary |
| Casts by FID | Snapchain (via `/api/farcaster/[fid]/casts`) | Used by useFidStats, signers/enriched, signers/stats |
| Reactions/Links/Verifications by FID | Same | Same — 4 endpoints, same underlying Snapchain data |

**Key insight:** `castsByFid`, `reactionsByFid`, `linksByFid`, `verificationsByFid` are fetched repeatedly for the same FID across:
- `useFidStats` (4 calls)
- `useAppsWithSigners` → signers/enriched (5 calls, 4 of which overlap)
- `useSignerMessages` (4 calls, client-side)
- `/api/signers/stats` (4 calls)

No shared cache across these. Each request path hits Snapchain independently.

---

## Current Caching

| Layer | Mechanism | TTL |
|-------|-----------|-----|
| Neynar lib | `fetch(..., next: { revalidate: 3600 })` | 1 hr |
| Farcaster lib | Same | 1 hr |
| Snapchain | `makeCachedRequest` uses `next: { revalidate: 3600 }` | 1 hr |
| API routes | `Cache-Control: max-age=3600` | 1 hr (CDN/browser) |
| React Query | `staleTime: 5min`, `gcTime: 10min` | Client-side only |

**Gaps:**
- No cross-request deduplication (e.g. two components asking for same FID's casts = 2 upstream calls)
- No request coalescing
- Snapchain `getInfo` uses `makeRequest` (no cache)
- `useSignerMessages` calls Snapchain from client — bypasses Next.js server cache entirely

---

## Would a Unified Data Layer Backend Help?

### High-Value Benefits

1. **Single cache for FID-scoped data**
   - One "messages by FID" (casts + reactions + links + verifications) cache
   - `useFidStats`, `signers/enriched`, `signers/stats`, `useSignerMessages` could all hit same cached blob
   - Cache key: `fid:{fid}:messages` — one upstream fetch, many consumers

2. **Request coalescing**
   - 10 concurrent requests for same cast = 1 Neynar/Snapchain call

3. **Batching**
   - Neynar `getUsers` already supports bulk; a data layer could batch "get app profiles for these 20 FIDs" from multiple profile views

4. **Schema normalization**
   - One canonical cast format, one user format — frontend stops juggling Neynar vs Farcaster vs Hub shapes

5. **Fallback / resilience**
   - Neynar down → try Farcaster API for user
   - Centralized retries, timeouts, circuit breakers

6. **Move client-side Snapchain calls server-side**
   - `useSignerMessages` today hits Snapchain from the browser; a data layer would proxy this, avoiding CORS and enabling proper caching

### Tradeoffs

| Pro | Con |
|-----|-----|
| Centralized caching | New service to deploy, monitor, scale |
| Coalescing + batching | Extra network hop (client → data layer → upstream) |
| Single source of truth | Cache invalidation complexity (e.g. live feed events) |
| Easier to add new sources | Need to keep schemas in sync with upstream changes |

---

## Recommendation

### Option A: Full Data Layer Service (High effort, high payoff)

**Worth it if:**
- You expect meaningful traffic (hundreds+ concurrent users)
- Neynar rate limits or costs are a concern
- You want to add more Farcaster data sources (e.g. Airstack, Pinata) without touching every route

**Design sketch:**
- Standalone service (Node, Go, etc.) or separate Next.js API routes with a shared Redis/Upstash cache
- Endpoints: `/user/:fid`, `/user/by-username/:username`, `/cast/:hash`, `/fid/:fid/messages`, `/fid/:fid/signers`, etc.
- Cache keys: `user:{fid}`, `cast:{hash}`, `fid:{fid}:messages`, `fid:{fid}:signers`
- TTLs: 5–15 min for messages (they change), 1 hr for user/cast
- Request coalescing for identical in-flight keys

### Option B: Enhanced Next.js API (Lower effort, good payoff)

**Worth it if:**
- You want quick wins without new infra
- Traffic is moderate

**Concrete changes:**
1. **Add Redis/Upstash** to existing Next.js API routes for shared cache
2. **Create aggregate endpoints:**
   - `GET /api/fid/[fid]/full` → `{ user, keys, messagesSummary, signers }` in one call
   - Replaces: getNeynarUser + getFarcasterKeys + useAppsWithSigners (which does 5+ calls)
3. **Route `/api/signers/messages`** — server-side proxy for `useSignerMessages` so Snapchain isn’t called from the client
4. **Deduplicate FID message fetches** — one internal function that caches `castsByFid` etc., used by useFidStats, signers/enriched, signers/stats

### Option C: Minimal (Fastest)

1. Add `/api/signers/messages?fid=&signer=` that wraps the 4 Snapchain calls — move `useSignerMessages` off client-side Snapchain
2. Create `GET /api/fid/[fid]/stats` that returns `{ casts, reactions, links, verifications }` in one response — replace `useFidStats`’s 4 parallel calls with 1
3. Add Redis cache for `fid:{fid}:messages` with 10–15 min TTL

---

## Summary

| Question | Answer |
|----------|--------|
| Is there redundancy? | Yes — same FID message data fetched 3–4 ways; same cast from 4 sources |
| Is caching coherent? | Partially — per-route, no cross-request sharing |
| Would a data layer help? | Yes — especially for FID-scoped data and request coalescing |
| Full backend vs improve Next.js? | Depends on scale; Option B or C gets 70% of benefit with less ops |

The highest-leverage improvement is **consolidating FID message fetches** (casts, reactions, links, verifications) into one cached, coalesced path. That alone would cut a large fraction of Snapchain traffic and simplify the profile/signer flows.
