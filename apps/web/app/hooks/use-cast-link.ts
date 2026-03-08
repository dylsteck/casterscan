'use client';

import { NeynarV2Cast } from '../lib/types';
import { LOCAL_STORAGE_KEYS, type DefaultClient } from '../lib/local-storage';
import { useLocalStorage } from './use-local-storage';

export function useCastLink(neynarCast: NeynarV2Cast): string {
  const [defaultClient] = useLocalStorage<DefaultClient>(
    LOCAL_STORAGE_KEYS.DEFAULT_CLIENT,
    'farcaster'
  );

  const baseLink = `https://base.app/post/${neynarCast?.hash}`;
  const farcasterLink = `https://farcaster.xyz/${neynarCast.author.username}/${neynarCast?.hash}`

  if (defaultClient === 'baseapp') {
    return baseLink;
  }

  return farcasterLink;
}
