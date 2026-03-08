'use client';

import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      if (typeof window === 'undefined') {
        return () => {};
      }

      const media = window.matchMedia(query);
      const handleChange = () => {
        onStoreChange();
      };

      media.addEventListener('change', handleChange);

      return () => media.removeEventListener('change', handleChange);
    }, [query]),
    useCallback(() => window.matchMedia(query).matches, [query]),
    () => false
  );
}
