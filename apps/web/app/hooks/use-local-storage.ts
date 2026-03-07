'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setValue(JSON.parse(stored));
        } catch {
          setValue(stored as T);
        }
      }
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
      window.dispatchEvent(new Event('localStorageChange'));
    }
  };

  return [value, setStoredValue, mounted] as const;
}
