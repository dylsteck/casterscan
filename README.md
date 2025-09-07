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
2. Copy `.env.example` to a new `.env.local` file and add your Neynar API key under `NEYNAR_API_KEY`
3. Run the development server: `bun run dev`

Have any questions/comments or want to keep up with/contribute to Casterscan? 
- [Message me on Farcaster](https://farcaster.xyz/dylsteck.eth)
- [Create an issue](https://github.com/dylsteck/casterscan/issues/new)
