import WarpcastIcon from "../components/icons/apps/warpcast-icon";
import SuperIcon from "../components/icons/apps/super-icon";
import RecasterIcon from "../components/icons/apps/recaster-icon";
import React from "react";
import { Client } from "./types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import UnofficialIcon from "../components/icons/apps/unofficial-icon";
import ZapperIcon from "../components/icons/apps/zapper-icon";
import CoinbaseWalletIcon from "../components/icons/apps/coinbase-wallet-icon";

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

export const cachedRequest = async (url: string, revalidate: number, method = 'GET', headers?: Record<string, string>) => {
    const response = await fetch(url, {
        method: method,
        headers: headers,
        next: {
            revalidate: revalidate
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch cast from the selected hub');
    }

    return response.json();
};

export const CLIENTS: Client[] = [
  {
    name: "Warpcast",
    username: "warpcast",
    fid: 9152,
    icon: React.createElement(WarpcastIcon, { className: "ml-2 size-7" }),
    castLink: "https://warpcast.com/",
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

export const NEYNAR_API_URL = 'https://api.neynar.com';
export const NEYNAR_HUB_API_URL = 'https://hub-api.neynar.com';
export const PINATA_HUB_GRPC_URL = 'hub-grpc.pinata.cloud';
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