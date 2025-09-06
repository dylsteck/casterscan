'use client';

import { SNAPCHAIN_NODE_URL } from './utils';

export const LOCAL_STORAGE_KEYS = {
  DEFAULT_CLIENT: 'default_client',
  SNAPCHAIN_NODE_URL: 'snapchain_node_url',
} as const;

export type DefaultClient = 'farcaster' | 'baseapp';

export const getDefaultClient = (): DefaultClient => {
  if (typeof window === 'undefined') return 'farcaster';
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DEFAULT_CLIENT) as DefaultClient;
  return (stored && (stored === 'farcaster' || stored === 'baseapp')) ? stored : 'farcaster';
};

export const setDefaultClient = (client: DefaultClient): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.DEFAULT_CLIENT, client);
  window.dispatchEvent(new Event('localStorageChange'));
};

export const getSnapchainNodeUrl = (): string => {
  if (typeof window === 'undefined') return SNAPCHAIN_NODE_URL;
  return localStorage.getItem(LOCAL_STORAGE_KEYS.SNAPCHAIN_NODE_URL) || SNAPCHAIN_NODE_URL;
};

export const setSnapchainNodeUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.SNAPCHAIN_NODE_URL, url);
  window.dispatchEvent(new Event('localStorageChange'));
};

export const validateSnapchainUrl = async (url: string): Promise<boolean> => {
  try {
    new URL(url);
  } catch {
    return false;
  }

  try {
    let snapchainHttpUrl = url;
    if (snapchainHttpUrl === SNAPCHAIN_NODE_URL) {
      snapchainHttpUrl += ':3381';
    }
    const response = await fetch(`${snapchainHttpUrl}/v1/info`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
};
