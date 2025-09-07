import React from "react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const localUrl = `http://localhost:${port}`;
export const BASE_URL = isDev 
  ? localUrl 
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://casterscan.com';

export const BANNER_IMG_URL = 'https://i.imgur.com/KJ7qfro.png';
export const ICON_IMG_URL = 'https://i.imgur.com/PD1XTs5.jpeg';

export const SEO = {
  title: 'Casterscan',
  description: 'A block explorer for Farcaster',
  ogImage: BANNER_IMG_URL,
  url: BASE_URL,
};


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

export const CACHE_TTLS = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  VERY_LONG: 86400,
  REACT_QUERY: {
    STALE_TIME: 5 * 60 * 1000,
    GC_TIME: 10 * 60 * 1000,
    REFETCH_INTERVAL: 60 * 1000
  }
};

export const NEYNAR_API_URL = 'https://api.neynar.com';
export const NEYNAR_HUB_API_URL = 'https://snapchain-api.neynar.com';
export const FARCASTER_API_URL = 'https://api.farcaster.xyz';
export const SNAPCHAIN_NODE_BASE_URL = 'https://snap.farcaster.xyz';

export const renderCastText = (text: string) => {
  if(text.length > MAX_CAST_PREVIEW_CHARS){
    return `${text.slice(0, MAX_CAST_PREVIEW_CHARS)}...`;
  }
  return text;
}