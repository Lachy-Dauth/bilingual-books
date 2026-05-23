'use client';

import { useEffect, useState } from 'react';

/**
 * Like useState but synced to localStorage. The value lives in state for fast
 * reads; the storage write happens via a useEffect on every change. On mount,
 * if storage has a value, we adopt it (overriding the initial).
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* localStorage unavailable or value corrupt — keep initial */
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / disabled — silently ignore */
    }
  }, [key, value, loaded]);

  return [value, setValue];
}
