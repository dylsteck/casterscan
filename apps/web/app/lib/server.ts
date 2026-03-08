'use server';

import { NeynarV2Cast, NeynarV2User } from './types';
import { apiFetch } from './api';

export async function getNeynarCast(identifier: string, type: 'url' | 'hash') {
  try {
    const hash = type === 'hash' ? identifier : identifier.match(/0x[a-fA-F0-9]+/)?.[0];
    if (!hash) throw new Error('Could not extract hash from identifier');
    return await apiFetch<NeynarV2Cast>(`/v1/casts/${hash}`);
  } catch (error) {
    console.error('Error fetching Neynar cast:', error);
    throw error;
  }
}

export async function getFarcasterCast(hash: string) {
  try {
    return await apiFetch(`/v1/casts/${hash}?format=farcaster-api`);
  } catch (error) {
    console.error('Error fetching Farcaster cast:', error);
    return null;
  }
}

export async function getHubCast(fid: number, hash: string, type: 'neynar' | 'farcaster') {
  try {
    const format = type === 'neynar' ? 'neynar-hub' : 'farcaster-hub';
    return await apiFetch(`/v1/casts/${hash}?format=${format}&fid=${fid}`);
  } catch (error) {
    console.error(`Error fetching ${type} hub cast:`, error);
    return null;
  }
}

export async function getNeynarUser(fid: string) {
  try {
    return await apiFetch<NeynarV2User>(`/v1/users/${fid}`);
  } catch (error) {
    console.error('Error fetching Neynar user:', error);
    throw error;
  }
}

export async function getNeynarUserByUsername(username: string) {
  try {
    return await apiFetch<NeynarV2User>(`/v1/users/by-username/${encodeURIComponent(username)}`);
  } catch (error) {
    console.error('Error fetching Neynar user by username:', error);
    throw error;
  }
}