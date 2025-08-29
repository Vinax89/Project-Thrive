import { useEffect, useState } from 'react';

export type HealthStatus = {
  status: 'ok' | 'down' | 'unknown';
  version?: string;
  uptime?: number;
  node?: string;
  error?: string;
};

export function useApiHealth(apiBase?: string, intervalMs = 15000) {
  const [health, setHealth] = useState<HealthStatus>({ status: 'unknown' });

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const url = (apiBase || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    async function ping() {
      if (!url) {
        setHealth({ status: 'down', error: 'VITE_API_URL not set' });
        return;
      }
      try {
        const r = await fetch(`${url}/healthz`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        setHealth({ status: 'ok', version: json.version, uptime: json.uptime, node: json.node });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'fetch failed';
        setHealth({ status: 'down', error: message });
      }
    }

    const start = () => {
      if (timer || document.hidden) return;
      ping();
      timer = setInterval(ping, intervalMs);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [apiBase, intervalMs]);

  return health;
}
