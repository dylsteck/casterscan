import { NextRequest } from "next/server";
import { frames } from "../../frames";
import { ActionMetadata } from "frames.js";
const appURL = 'https://casterscan.com';

export const GET = async (req: NextRequest) => {
  const actionMetadata: ActionMetadata = {
    action: {
      type: "post",
    },
    icon: "link-external",
    name: "Inspect Cast",
    aboutUrl: `${appURL}`,
    description: "Inspect the raw details of a cast on Casterscan",
  };

  return Response.json(actionMetadata);
};

export const POST = frames(async (ctx) => {
  const hash = ctx.message?.castId?.hash;
  return Response.json({
    message: `Click to Inspect Cast`,
    link: `${appURL}/casts/${hash}`,
    type: 'message'
  });
});