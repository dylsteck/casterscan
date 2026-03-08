'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

const subscribeToClient = () => {
  return () => {};
};

function subscribeToLocalStorage(key: string, onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === null || event.key === key) {
      onStoreChange();
    }
  };

  const handleCustomStorageChange = () => {
    onStoreChange();
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('localStorageChange', handleCustomStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('localStorageChange', handleCustomStorageChange);
  };
}

function getStoredValue(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(key);
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const rawValue = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => subscribeToLocalStorage(key, onStoreChange), [key]),
    useCallback(() => getStoredValue(key), [key]),
    () => null
  );
  const mounted = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const value = useMemo(() => {
    if (rawValue === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as T;
    }
  }, [defaultValue, rawValue]);

  const setStoredValue = useCallback((newValue: T) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
      window.dispatchEvent(new Event('localStorageChange'));
    }
  }, [key]);

  return [value, setStoredValue, mounted] as const;
}
