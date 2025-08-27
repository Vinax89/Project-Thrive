import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function useRemoteList<T extends { id: string }>(path: string, token: string | null) {
  const [list, setList] = useState<T[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]));
  }, [path, token]);

  const create = useCallback(async (item: T) => {
    if (!token) return;
    const res = await fetch(`${API}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    setList((prev) => [...prev, data]);
  }, [path, token]);

  const update = useCallback(async (item: T) => {
    if (!token) return;
    await fetch(`${API}/${path}/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });
    setList((prev) => prev.map((x) => (x.id === item.id ? item : x)));
  }, [path, token]);

  const remove = useCallback(async (id: string) => {
    if (!token) return;
    await fetch(`${API}/${path}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setList((prev) => prev.filter((x) => x.id !== id));
  }, [path, token]);

  return { list, setList, create, update, remove } as const;
}
