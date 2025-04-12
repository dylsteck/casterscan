# Casterscan

## A block explorer for Farcaster
You can [check it out here](https://casterscan.com)

![Casterscan as of 4/12/25](https://i.imgur.com/rqKPvAR.png)

## What is Casterscan?

Casterscan is a block explorer for Farcaster. It currently lets you view:
- a firehose of the latest casts, either as a list or grid
- the details of any cast(text, embeds, responses per api/hub provider)
    - you can also view cast details with our [cast action](https://warpcast.com/~/add-cast-action?url=https://casterscan.com/frames/actions/inspect-cast)

There are two goals for Casterscan's utility:
- make it easy to access Farcaster data
- give each atomic unit of data available on [hubs](https://www.thehubble.xyz/) its own URL, starting with casts


## How to run locally
1. `npm install`
2. Copy `.env.example` to a new `.env.local` file and add your Neynar API key under `NEYNAR_API_KEY`
3. `npm run dev`

Have any questions/comments or want to keep up with/contribute to Casterscan? 
- [Message on Warpcast](https://warpcast.com/dylsteck.eth)
- [Create an issue](https://github.com/dylsteck/casterscan/issues)
