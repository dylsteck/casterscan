'use client';

import { useState, useEffect } from 'react';
import { NeynarV2Cast } from '../lib/types';
import { getDefaultClient, LOCAL_STORAGE_KEYS, type DefaultClient } from '../lib/local-storage';

export function useCastLink(neynarCast: NeynarV2Cast): string {
  const [mounted, setMounted] = useState(false);
  const [defaultClient, setDefaultClient] = useState<DefaultClient>('farcaster');

  const baseLink = `https://base.app/post/${neynarCast?.hash}`;
  const farcasterLink = `https://farcaster.xyz/${neynarCast.author.username}/${neynarCast?.hash}`

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
