# Casterscan API

Unified Farcaster API with Redis cache and request coalescing. Consolidates Neynar, Snapchain, Farcaster API, and Optimism RPC into a single REST API.

## Setup

1. Set env vars (from root `.env.example`):
   - `NEYNAR_API_KEY` (required for user/cast lookups)
   - `REDIS_URL` (optional; cache disabled if unset)

2. Run locally:
   ```bash
   bun run dev:api
   ```

3. Or run both web and API:
   ```bash
   bun run dev
   ```

## API

- `GET /health` — Health check
- `GET /v1/fids/:fid/stats` — Cast/reaction/link/verification counts
- `GET /v1/fids/:fid/messages` — All messages by FID
- `GET /v1/fids/:fid/signers/enriched` — Signers with app profiles
- `GET /v1/fids/:fid/signers/:signer/messages` — Messages filtered by signer
- `GET /v1/fids/:fid/signers/:signer/stats` — Signer stats
- `GET /v1/fids/:fid/keys` — Auth addresses and signer keys
- `GET /v1/users/:fid` — User by FID
- `GET /v1/users/by-username/:username` — User by username
- `GET /v1/casts/:hash` — Enriched cast
- `GET /v1/snapchain/info` — Snapchain node info
