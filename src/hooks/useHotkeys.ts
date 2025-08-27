import { useEffect, useMemo } from 'react';

interface ParsedBinding {
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  fn: (e: KeyboardEvent) => void;
}

export default function useHotkeys(bindings: Array<[string, (e: KeyboardEvent) => void]>) {
  const parsedBindings = useMemo<ParsedBinding[]>(
    () =>
      bindings.map(([combo, fn]) => {
        const parts = combo.toLowerCase().split('+').map((s) => s.trim());
        return {
          key: parts[parts.length - 1],
          ctrl: parts.includes('ctrl'),
          meta: parts.includes('meta'),
          shift: parts.includes('shift'),
          fn,
        };
      }),
    [bindings]
  );

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      for (const { key, ctrl, meta, shift, fn } of parsedBindings) {
        if (meta && !e.metaKey) continue;
        if (ctrl && !e.ctrlKey) continue;
        if (shift && !e.shiftKey) continue;
        if (e.key.toLowerCase() === key) {
          e.preventDefault();
          fn(e);
          return;
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [parsedBindings]);
}
