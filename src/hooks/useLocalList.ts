import { useEffect, useState } from 'react';

export default function useLocalList<T>(key: string, initial: T[]) {
  const [list, setList] = useState<T[]>(() => {
    const raw = localStorage.getItem(key);
    if (!raw) return initial;
    try {
      return JSON.parse(raw) as T[];
    } catch (error) {
      console.warn(
        `Failed to parse localStorage item "${key}". Removing corrupted data:`,
        error,
      );
      localStorage.removeItem(key);
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(list));
  }, [key, list]);
  return [list, setList] as const;
}
