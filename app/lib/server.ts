'use server';

import { NeynarV2Cast, NeynarV2User, FarcasterCast, HubCast, ProfileKeysPage } from './types';
import { fetchKeysForFid } from './farcaster/keys';
import { BASE_URL, NEYNAR_API_URL, FARCASTER_API_URL } from './utils';

export async function getNeynarCast(identifier: string, type: 'url' | 'hash') {
  try {
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
  } catch (error) {
    console.error('Error fetching Neynar cast:', error);
    throw error; // Keep throwing for critical path
  }
}

export async function getFarcasterCast(hash: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/farcaster/cast?hash=${hash}`, {
        method: 'GET',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch Farcaster cast, status:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data?.result?.casts && Array.isArray(data.result.casts)) {
      return data.result.casts.find((cast: { hash: string }) => cast.hash === hash);
    } else if (data?.casts && Array.isArray(data.casts)) {
      return data.casts.find((cast: { hash: string }) => cast.hash === hash);
    } else if (data?.result && Array.isArray(data.result)) {
      return data.result.find((cast: { hash: string }) => cast.hash === hash);
    } else {
      console.error('Unexpected Farcaster cast data structure:', JSON.stringify(data).substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('Error fetching Farcaster cast:', error);
    return null;
  }
}

export async function getHubCast(fid: number, hash: string, type: 'neynar' | 'farcaster') {
  try {
    const response = await fetch(`${BASE_URL}/api/snapchain/cast?fid=${fid}&hash=${hash}&type=${type}`, {
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${type} hub cast, status:`, response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} hub cast:`, error);
    return null;
  }
}

export async function getNeynarUser(fid: string) {
  try {
    const response = await fetch(
      `${NEYNAR_API_URL}/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'x-api-key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch Neynar user');
    const data = await response.json();
    return data.users[0];
  } catch (error) {
    console.error('Error fetching Neynar user:', error);
    throw error;
  }
}

export async function getFarcasterKeys(fid: string): Promise<ProfileKeysPage> {
  try {
    const fidBigInt = BigInt(fid);
    return await fetchKeysForFid(fidBigInt, 0, 250);
  } catch (error) {
    console.error('Error fetching Farcaster keys:', error);
    return {
      fid: BigInt(fid),
      authAddresses: [],
      signerKeys: [],
      page: 0,
      pageSize: 250,
      hasMore: false,
    };
  }
}