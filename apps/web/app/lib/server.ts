'use server';

import { NeynarV2Cast, NeynarV2User, ProfileKeysPage } from './types';
import { BASE_URL } from './utils';
import { dataLayerFetch } from './data-layer';

export async function getNeynarCast(identifier: string, type: 'url' | 'hash') {
  try {
    const hash = type === 'hash' ? identifier : identifier.match(/0x[a-fA-F0-9]+/)?.[0];
    if (!hash) throw new Error('Could not extract hash from identifier');
    return await dataLayerFetch<NeynarV2Cast>(`/v1/casts/${hash}`);
  } catch (error) {
    console.error('Error fetching Neynar cast:', error);
    throw error;
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
    return await dataLayerFetch<NeynarV2User>(`/v1/users/${fid}`);
  } catch (error) {
    console.error('Error fetching Neynar user:', error);
    throw error;
  }
}

export async function getNeynarUserByUsername(username: string) {
  try {
    return await dataLayerFetch<NeynarV2User>(`/v1/users/by-username/${encodeURIComponent(username)}`);
  } catch (error) {
    console.error('Error fetching Neynar user by username:', error);
    throw error;
  }
}

export async function getFarcasterKeys(fid: string): Promise<ProfileKeysPage> {
  try {
    const data = await dataLayerFetch<{ fid: string; authAddresses: `0x${string}`[]; signerKeys: `0x${string}`[]; page: number; pageSize: number; hasMore: boolean }>(`/v1/fids/${fid}/keys`);
    return {
      fid: BigInt(data.fid),
      authAddresses: data.authAddresses,
      signerKeys: data.signerKeys,
      page: data.page,
      pageSize: data.pageSize,
      hasMore: data.hasMore,
    };
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