'use server';

import { NeynarV2Cast, WarpcastCast, HubCast } from './types';
import { NEYNAR_API_URL, WARPCAST_API_URL } from './utils';

export async function getNeynarCast(identifier: string, type: 'url' | 'hash') {
  const response = await fetch(
    `${NEYNAR_API_URL}/v2/farcaster/cast?identifier=${identifier}&type=${type}`,
    {
      headers: {
        'x-api-key': process.env.NEYNAR_API_KEY || '',
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) throw new Error('Failed to fetch Neynar cast');
  const data = await response.json();
  return data.cast;
}

export async function getWarpcastCast(hash: string) {
  const response = await fetch(
    `${WARPCAST_API_URL}/v2/cast-by-hash?hash=${hash}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WARPCAST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) throw new Error('Failed to fetch Warpcast cast');
  const data = await response.json();
  return Array.isArray(data.result.casts) 
    ? data.result.casts.find((cast: { hash: string }) => cast.hash === hash)
    : null;
}

export async function getHubCast(fid: number, hash: string, type: 'neynar' | 'warpcast') {
  const response = await fetch(`/api/hub/cast?fid=${fid}&hash=${hash}&type=${type}`);
  if (!response.ok) throw new Error('Failed to fetch Hub cast');
  return await response.json();
}