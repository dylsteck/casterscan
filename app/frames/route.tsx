/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
import { BANNER_IMG_URL, SEO } from "../lib/utils";

function constructCastActionUrl(params: { url: string }): string {
  const baseUrl = "https://warpcast.com/~/add-cast-action";
  const urlParams = new URLSearchParams({
    url: params.url,
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

export const GET = frames(async (ctx) => {
  const installFrameActionUrl = constructCastActionUrl({
    url: `${SEO.url}/frames/actions/inspect-cast`,
  });
  return {
    image: BANNER_IMG_URL,
    buttons: [
      <Button action="link" target={SEO.url}>
        View website
      </Button>,
      <Button action="link" target={installFrameActionUrl}>
        Install Cast Action
      </Button>,
    ],
  };
});