'use server';

import { NeynarV2Cast, WarpcastCast, HubCast } from './types';
import { BASE_URL, NEYNAR_API_URL, WARPCAST_API_URL } from './utils';

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
    `${BASE_URL}/api/warpcast/cast?hash=${hash}`, {
      method: 'GET',
    }
  );

  if (!response.ok) throw new Error('Failed to fetch Warpcast cast');
  const data = await response.json();
  
  if (data?.result?.casts && Array.isArray(data.result.casts)) {
    return data.result.casts.find((cast: { hash: string }) => cast.hash === hash);
  } else if (data?.casts && Array.isArray(data.casts)) {
    return data.casts.find((cast: { hash: string }) => cast.hash === hash);
  } else if (data?.result && Array.isArray(data.result)) {
    return data.result.find((cast: { hash: string }) => cast.hash === hash);
  } else {
    console.error('Unexpected Warpcast cast data structure:', JSON.stringify(data).substring(0, 200));
    return null;
  }
}

export async function getHubCast(fid: number, hash: string, type: 'neynar' | 'warpcast') {
  const response = await fetch(`${BASE_URL}/api/hub/cast?fid=${fid}&hash=${hash}&type=${type}`);
  if (!response.ok) throw new Error('Failed to fetch Hub cast');
  return await response.json();
}