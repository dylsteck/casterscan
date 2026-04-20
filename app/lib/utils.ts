import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const isDev = import.meta.env.DEV;
const localUrl = "http://localhost:3000";
const processBaseUrl =
  typeof process !== "undefined" && typeof process.env !== "undefined" ? process.env.BASE_URL : undefined;
export const BASE_URL = processBaseUrl || import.meta.env.VITE_BASE_URL || (isDev ? localUrl : localUrl);

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
  SHORT: 300, // 5 minutes
  FIFTEEN_MIN: 900, // 15 min - for resources with Redis TTL 900
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  REACT_QUERY: {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    GC_TIME: 10 * 60 * 1000, // 10 minutes
    REFETCH_INTERVAL: 60 * 1000 // 1 minute
  }
};

export const renderCastText = (text: string) => {
  if(text.length > MAX_CAST_PREVIEW_CHARS){
    return `${text.slice(0, MAX_CAST_PREVIEW_CHARS)}...`;
  }
  return text;
}
