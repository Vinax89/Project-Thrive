import { useEffect, useState } from 'react';

export default function useLocalList<T>(key: string, initial: T[]) {
  const hasStorage = typeof window !== 'undefined' && 'localStorage' in window;

  const [list, setList] = useState<T[]>(() => {
    if (!hasStorage) return initial;

    const raw = window.localStorage.getItem(key);
    if (!raw) return initial;
    try {
      return JSON.parse(raw) as T[];
    } catch (error) {
      console.warn(
        `Failed to parse localStorage item "${key}". Removing corrupted data:`,
        error,
      );
      window.localStorage.removeItem(key);
      return initial;
    }
  });

  useEffect(() => {
    if (!hasStorage) return;

    window.localStorage.setItem(key, JSON.stringify(list));
  }, [hasStorage, key, list]);

  return [list, setList] as const;
}
