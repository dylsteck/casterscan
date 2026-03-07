# Casterscan Web

Next.js frontend for Casterscan block explorer. Proxies all requests through Next.js API routes to the Casterscan API.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdylsteck%2Fcasterscan%2Ftree%2Fmain%2Fapps%2Fweb&project-name=casterscan-web&env=API_URL&envDescription=Deployed%20API%20URL)

Requires `API_URL`. Deploy the [API](../api) first.

## Setup

1. Copy `.env.example` to `.env.local` and set `API_URL` (default: `http://localhost:4000` for local dev).
2. Run locally:
   ```bash
   bun run dev:web
   ```
3. Or run both web and API from root:
   ```bash
   bun run dev
   ```
