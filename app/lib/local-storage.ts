'use client';

export const LOCAL_STORAGE_KEYS = {
  DEFAULT_CLIENT: 'default_client',
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
