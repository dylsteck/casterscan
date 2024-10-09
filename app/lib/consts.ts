
export const SEO = {
    title: 'Casterscan',
    description: 'A block explorer for Farcaster',
    ogImage: 'https://i.imgur.com/KJ7qfro.png',
    url: 'https://casterscan.com',
};

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const localUrl = `http://localhost:${port}`;

export const BASE_URL = isDev 
  ? localUrl 
  : 'https://casterscan.com';

export const WARPCAST_HUB_URLS = [
  'https://hoyt.farcaster.xyz:2281',
  'https://lamia.farcaster.xyz:2281',
];