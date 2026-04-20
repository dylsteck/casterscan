'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export function useUrlQueryState<T extends string>(key: string, defaultValue: T): [T, (value: T | null) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get(key);
    if (fromUrl) {
      setValue(fromUrl as T);
    }
  }, [key]);

  const setQueryValue = useCallback(
    (nextValue: T | null) => {
      const url = new URL(window.location.href);
      if (nextValue === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, nextValue);
      }
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      if (nextValue !== null) {
        setValue(nextValue);
      } else {
        setValue(defaultValue);
      }
    },
    [defaultValue, key]
  );

  return useMemo(() => [value, setQueryValue], [setQueryValue, value]);
}

export function useOptionalUrlQueryState(key: string): [string | null, (value: string | null) => void] {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    setValue(url.searchParams.get(key));
  }, [key]);

  const setQueryValue = useCallback((nextValue: string | null) => {
    const url = new URL(window.location.href);
    if (nextValue === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, nextValue);
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setValue(nextValue);
  }, [key]);

  return useMemo(() => [value, setQueryValue], [setQueryValue, value]);
}
