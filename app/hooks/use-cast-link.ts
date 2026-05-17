'use client';

import { useState, useEffect } from 'react';
import type { HypersnapV2Cast } from '../lib/types';
import { getDefaultClient, LOCAL_STORAGE_KEYS, type DefaultClient } from '../lib/local-storage';

export function useCastLink(hypersnapCast: HypersnapV2Cast): string {
  const [mounted, setMounted] = useState(false);
  const [defaultClient, setDefaultClient] = useState<DefaultClient>('farcaster');

  const baseLink = `https://base.app/post/${hypersnapCast?.hash}`;
  const farcasterLink = `https://farcaster.xyz/${hypersnapCast.author.username}/${hypersnapCast?.hash}`

  useEffect(() => {
    setMounted(true);
    
    const updateClient = () => {
      setDefaultClient(getDefaultClient());
    };

    updateClient();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEYS.DEFAULT_CLIENT) {
        updateClient();
      }
    };

    const handleCustomStorageChange = () => {
      updateClient();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  if (!mounted) {
    return farcasterLink;
  }

  if (defaultClient === 'baseapp') {
    return baseLink;
  }

  return farcasterLink;
}
