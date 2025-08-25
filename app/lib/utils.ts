import FarcasterIcon from "../components/icons/apps/farcaster-icon";
import SuperIcon from "../components/icons/apps/super-icon";
import RecasterIcon from "../components/icons/apps/recaster-icon";
import React from "react";
import { Client } from "./types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import UnofficialIcon from "../components/icons/apps/unofficial-icon";
import ZapperIcon from "../components/icons/apps/zapper-icon";
import CoinbaseWalletIcon from "../components/icons/apps/coinbase-wallet-icon";
import { getCachedData, cacheData } from "./cloudflare-kv";

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

export const cachedRequest = async (url: string, revalidate: number, method = 'GET', headers?: Record<string, string>, cacheTag?: string) => {
    if (cacheTag) {
        const cachedData = await getCachedData(cacheTag);
        if (cachedData) {
            return cachedData;
        }
    }

    const response = await fetch(url, {
        method: method,
        headers: headers,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch from ${url} (status: ${response.status})`);
    }

    const data = await response.json();
    
    if (cacheTag) {
        try {
            await cacheData(cacheTag, data, revalidate);
        } catch (cacheError) {
            console.warn('Failed to cache data:', cacheError);
            // Don't fail the request if caching fails
        }
    }

    return data;
};

export const CLIENTS: Client[] = [
  {
    name: "Farcaster",
    username: "farcaster",
    fid: 9152,
    icon: React.createElement(FarcasterIcon, { className: "ml-2 size-7" }),
    castLink: "https://farcaster.xyz/",
  },
  {
    name: "Super",
    username: "super",
    fid: 193137,
    icon: React.createElement(SuperIcon, { className: "ml-2 w-5 h-5" }),
    castLink: "https://super.sc/c/",
  },
  {
    name: "Recaster",
    username: "recaster-fc",
    fid: 356900,
    icon: React.createElement(RecasterIcon, { className: "ml-2 w-5 h-5" }),
    castLink: "https://recaster.org/cast/",
  },
  {
    name: "Unofficial",
    username: "unofficial", 
    fid: 16999,
    icon: React.createElement(UnofficialIcon, { className: "ml-2 w-5 h-5" }),
    castLink: "",
  },
  {
    name: "Zapper",
    username: "zapper",
    fid: 827605,
    icon: React.createElement(ZapperIcon, { className: "ml-2 w-5 h-5" }),
    castLink: "",
  },
  {
    name: "Coinbase Wallet",
    username: "coinbasewallet",
    fid: 309857,
    icon: React.createElement(CoinbaseWalletIcon, { className: "ml-2 w-5 h-5" }),
    castLink: "",
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

export const HUB_GRPC_URL = 'hub-grpc.pinata.cloud';
export const NEYNAR_API_URL = 'https://api.neynar.com';
export const NEYNAR_HUB_API_URL = 'https://snapchain-api.neynar.com';
export const FARCASTER_API_URL = 'https://api.farcaster.xyz';

export const renderCastText = (text: string) => {
  if(text.length > MAX_CAST_PREVIEW_CHARS){
    return `${text.slice(0, MAX_CAST_PREVIEW_CHARS)}...`;
  }
  return text;
}

export const FARCASTER_HUB_URLS = [
  'https://snap.farcaster.xyz:3381',
  // https://hub.merv.fun/v1/info
  // ^ non farcaster
];