/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
const appURL = 'https://casterscan.com';

function constructCastActionUrl(params: { url: string }): string {
  const baseUrl = "https://warpcast.com/~/add-cast-action";
  const urlParams = new URLSearchParams({
    url: params.url,
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

export const GET = frames(async (ctx) => {
  const installFrameActionUrl = constructCastActionUrl({
    url: `${appURL}/frames/actions/inspect-cast`,
  });

  return {
    image: 'https://i.imgur.com/KJ7qfro.png',
    buttons: [
      <Button action="link" target={appURL}>
        View website
      </Button>,
      <Button action="link" target={installFrameActionUrl}>
        Install Cast Action
      </Button>,
    ],
  };
});