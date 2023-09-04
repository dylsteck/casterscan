# Casterscan

### A block explorer for Farcaster
You can [check it out here](https://casterscan.com)

![Casterscan v2 homepage](https://i.imgur.com/mbKEweW.png)

### What is Casterscan?

Casterscan is a block explorer for Farcaster. It lets you view and query all casts & profiles, view channels, and see raw metadata you would otherwise have to run code to get.

There are two goals for Casterscan's utility:
- make it easy to access/query Farcaster data
- give each atomic unit of data available on [Hubs](https://www.thehubble.xyz/) its own URL, starting with casts and profiles


### How to run locally
1. Run [Warpcast's Postgres replicator](https://github.com/farcasterxyz/hub-monorepo/tree/main/packages/hub-nodejs/examples/replicate-data-postgres)
2. Copy `.env.example` to `.env` and add your Postgres connection URL to `PG_CONNECTION_STRING`
    - note: this should be the only key you need(leave every other value as `"example"`, will be removing deprecated .env values soon)
3. Run `npm install` and `npm run dev` to start the app locally, then view it at `localhost:3000`

Have any questions/comments or want to keep up with/contribute to Casterscan? 
- [Message Dylan](https://t.me/dylsteck)
- [Create an issue](https://github.com/dylsteck/casterscan/issues)
- [Check out the Roadmap](https://github.com/users/dylsteck/projects/1)
- [Follow on Warpcast](https://warpcast.com/casterscan)