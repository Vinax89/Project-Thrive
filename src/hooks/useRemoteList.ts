import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function useRemoteList<T extends { id: string }>(path: string, token: string | null) {
  const [list, setList] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(`${API}/${path}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setList(data);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err as Error);
      }
    };

    load();

    return () => controller.abort();
  }, [path, token]);

  const create = useCallback(async (item: T) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        throw new Error(`Failed to create ${path}`);
      }
      const data = await res.json();
      setList((prev) => [...prev, data]);
      setError(null);
      return data;
    } catch (err) {
      console.error(err);
      setError(err as Error);
      throw err;
    }
  }, [path, token]);

  const update = useCallback(async (item: T) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/${path}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        throw new Error(`Failed to update ${path}`);
      }
      setList((prev) => prev.map((x) => (x.id === item.id ? item : x)));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err as Error);
      throw err;
    }
  }, [path, token]);

  const remove = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/${path}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to delete ${path}`);
      }
      setList((prev) => prev.filter((x) => x.id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err as Error);
      throw err;
    }
  }, [path, token]);

  return { list, setList, create, update, remove, error } as const;
}
