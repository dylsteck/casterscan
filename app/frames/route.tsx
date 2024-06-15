/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { redirect } from "frames.js/core";
import { frames } from "./frames";
 
const handleRequest = frames(async (ctx) => {
  let currentState: any = ctx.state;
  return {
    image: 'https://i.imgur.com/KJ7qfro.png',
    buttons: [
       <Button action="link" target={'https://casterscan.com'}>View site</Button>
    ]
  };
});
 
export const GET = handleRequest;
export const POST = handleRequest;