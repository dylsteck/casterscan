import { NextRequest } from "next/server";
import { frames } from "../frames";
import { ActionMetadata } from "frames.js";
import { Button } from "frames.js/next";
import { SEO } from "@/app/consts";

export const GET = frames(async (ctx) => {
    const hash = ctx.searchParams.hash;
    return {
      image: `https://client.warpcast.com/v2/cast-image?castHash=${hash}`,
      imageOptions: {
        aspectRatio: '1:1'
      },
      buttons: [
        <Button action="link" target={`${SEO.url}/casts/${hash}`}>
          View on Casterscan
        </Button>,
        <Button action="link" target="https://warpcast.com/~/add-cast-action?url=https://casterscan.com/frames/actions/inspect-cast">
        Install Cast Action
      </Button>
      ],
    };
  })