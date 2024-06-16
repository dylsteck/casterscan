import { NextRequest } from "next/server";
import { frames } from "../../frames";
import { ActionMetadata } from "frames.js";
import { SEO } from "@/app/consts";

export const GET = async (req: NextRequest) => {
  const actionMetadata: ActionMetadata = {
    action: {
      type: "post",
    },
    icon: "link-external",
    name: "Inspect Cast",
    aboutUrl: `${SEO.url}`,
    description: "Inspect the raw details of a cast on Casterscan",
  };

  return Response.json(actionMetadata);
};

export const POST = frames(async (ctx) => {
  const hash = ctx.message?.castId?.hash;
  return Response.json({
    message: `Click to Inspect Cast`,
    link: `${SEO.url}/casts/${hash}`,
    type: 'message'
  });
});