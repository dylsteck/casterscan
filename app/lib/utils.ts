import WarpcastIcon from "../components/icons/warpcast-icon";
import SupercastIcon from "../components/icons/supercast-icon";
import RecasterIcon from "../components/icons/recaster-icon";
import React from "react";
import { Client } from "./types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BANNER_IMG_URL = 'https://i.imgur.com/KJ7qfro.png';
export const ICON_IMG_URL = 'https://i.imgur.com/PD1XTs5.jpeg';

export const SEO = {
    title: 'Casterscan',
    description: 'A block explorer for Farcaster',
    ogImage: BANNER_IMG_URL,
    url: 'https://casterscan.com',
};

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const localUrl = `http://localhost:${port}`;
export const BASE_URL = isDev 
  ? localUrl 
  : 'https://casterscan.com';

export const CLIENTS: Client[] = [
  {
    name: "Warpcast",
    icon: React.createElement(WarpcastIcon, { className: "ml-2 w-7 h-7" }),
    castLink: "https://warpcast.com/~/conversations/",
  },
  {
    name: "Supercast",
    icon: React.createElement(SupercastIcon, { className: "ml-2 w-5 h-5" }),
    castLink: "https://supercast.xyz/c/",
  },
  {
    name: "Recaster",
    icon: React.createElement(RecasterIcon, { className: "ml-2 w-5 h-5" }),
    castLink: "https://recaster.org/cast/",
  },
];

export const frame = (title = 'Open Casterscan', url = BASE_URL) => {
  return {
    version: "next",
    imageUrl: BANNER_IMG_URL,
    button: {
      title: title,
      action: {
        type: "launch_frame",
        name: "Casterscan",
        url: url,
        splashImageUrl: ICON_IMG_URL,
        splashBackgroundColor: "#FFFFFF",
      },
    },
  };
}

export const MAX_CAST_PREVIEW_CHARS = 280;

export const NEYNAR_API_URL = 'https://api.neynar.com';
export const NEYNAR_HUB_API_URL = 'https://hub-api.neynar.com';
export const WARPCAST_API_URL = 'https://api.warpcast.com';

export const renderCastText = (text: string) => {
  if(text.length > MAX_CAST_PREVIEW_CHARS){
    return `${text.slice(0, MAX_CAST_PREVIEW_CHARS)}...`;
  }
  return text;
}

export const WARPCAST_HUB_URLS = [
  'https://hoyt.farcaster.xyz:2281',
  'https://lamia.farcaster.xyz:2281',
];