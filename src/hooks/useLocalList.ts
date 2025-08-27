import { useEffect, useState } from 'react';

export default function useLocalList<T>(key: string, initial: T[]) {
  const [list, setList] = useState<T[]>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(list));
  }, [key, list]);
  return [list, setList] as const;
}
