import { useEffect, useState } from 'react';

export default function useLocalList<T>(key: string, initial: T[]) {
  const [list, setList] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : initial;
    } catch {
      // If reading or parsing fails, fall back to the initial value
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // Swallow write errors so updates don't break the app
    }
  }, [key, list]);
  return [list, setList] as const;
}
