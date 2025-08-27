import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      try {
        return (window.localStorage.getItem('theme') as Theme) || 'system';
      } catch {
        return 'system';
      }
    }
    return 'system';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const root = document.documentElement;
    const systemDark = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
    const isDark = theme === 'dark' || (theme === 'system' && systemDark);
    root.classList.toggle('dark', isDark);

    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className="text-gray-600 dark:text-gray-300">Theme</span>
      <select className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded"
        value={theme} onChange={e=>setTheme(e.target.value as Theme)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
