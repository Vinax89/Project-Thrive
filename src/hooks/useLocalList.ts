import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export default function useLocalList<T>(key: string, initial: T[]) {
  const hasStorage = typeof window !== 'undefined' && 'localStorage' in window;
  if (!hasStorage) {
    const noop: Dispatch<SetStateAction<T[]>> = () => {};
    return [initial, noop] as const;
  }

  const [list, setList] = useState<T[]>(() => {
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
    window.localStorage.setItem(key, JSON.stringify(list));
  }, [key, list]);
  return [list, setList] as const;
}
