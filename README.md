# Casterscan

A block explorer for Farcaster | [casterscan.com](https://casterscan.com)
<br/><br/>
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/dylsteck/casterscan)

![Casterscan as of 9/7/25](https://i.imgur.com/ryRhP0P.png)

## What is Casterscan?

Casterscan is a block explorer for Farcaster. It currently lets you view:
- a firehose of the latest casts, either as a list or grid
- the details of any cast(text, embeds, responses per API/Snapchain provider)

![Casterscan user signer data on /fids/[fid] as of 9/7/25](https://i.imgur.com/6zFB2dK.png)

There are two goals for Casterscan's utility:
- make it easy to access Farcaster data
- give each atomic unit of data available on [Snapchain](https://snapchain.farcaster.xyz) its own URL


## How to run locally

1. Install dependencies: `bun install`
2. Set up app-specific env files:
   - Copy `apps/api/.env.example` to `apps/api/.env` and set `NEYNAR_API_KEY` (optionally `REDIS_URL`).
   - Copy `apps/web/.env.example` to `apps/web/.env.local` and set `API_URL` if you are not using the default local API at `http://localhost:4000`.
3. Run the development server:
   - Both: `bun run dev`
   - Web only: `bun run dev:web`
   - API only: `bun run dev:api`

## Deployment

Deploy with Vercel. Deploy the **API first**, then the **Web** (the web app needs the API URL).

| [![Deploy API](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdylsteck%2Fcasterscan%2Ftree%2Fmain%2Fapps%2Fapi&project-name=casterscan-api&env=NEYNAR_API_KEY&envDescription=Get%20from%20neynar.com%20for%20user%2Fcast%20lookups&envLink=https%3A%2F%2Fneynar.com) | [![Deploy Web](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdylsteck%2Fcasterscan%2Ftree%2Fmain%2Fapps%2Fweb&project-name=casterscan-web&env=API_URL&envDescription=Deployed%20API%20URL) |
| --- | --- |
| **API** — Requires `NEYNAR_API_KEY` | **Web** — Requires `API_URL` |

## Monorepo structure

Casterscan is a Bun workspace/Turbo monorepo:

- `apps/web` — Next.js frontend and API proxy routes
- `apps/api` — Express API, upstream clients, and cache integration
- `packages/*` — shared packages (when present)
- `package.json` / `turbo.json` — workspace scripts and task orchestration

Have any questions/comments or want to keep up with/contribute to Casterscan? 
- [Message me on Farcaster](https://farcaster.xyz/dylsteck.eth)
- [Create an issue](https://github.com/dylsteck/casterscan/issues/new)
