import { useEffect, useMemo, useRef } from 'react';

interface ParsedBinding {
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  fn: (e: KeyboardEvent) => void;
}

/**
 * Registers keyboard shortcut bindings.
 *
 * Each binding is a tuple of a combo string and handler function. Supported
 * modifiers are `ctrl`, `meta`, `shift`, and `alt` (or `option`).
 *
 * Example:
 * ```ts
 * useHotkeys([
 *   ['ctrl+alt+k', (e) => console.log('hotkey', e)],
 *   ['option+p', save],
 * ]);
 * ```
 */
export default function useHotkeys(bindings: Array<[string, (e: KeyboardEvent) => void]>) {
  // Consumers should memoize `bindings` to avoid unnecessary updates
  // (e.g. with `useMemo`).
  const bindingsRef = useRef<ParsedBinding[]>([]);

  bindingsRef.current = useMemo<ParsedBinding[]>(
    () =>
      bindings.map(([combo, fn]) => {
        const parts = combo.toLowerCase().split('+').map((s) => s.trim());
        return {
          key: parts[parts.length - 1],
          ctrl: parts.includes('ctrl'),
          meta: parts.includes('meta'),
          shift: parts.includes('shift'),
          alt: parts.includes('alt') || parts.includes('option'),
          fn,
        };
      }),
    [bindings]
  );

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      for (const { key, ctrl, meta, shift, alt, fn } of bindingsRef.current) {
        if (meta && !e.metaKey) continue;
        if (ctrl && !e.ctrlKey) continue;
        if (shift && !e.shiftKey) continue;
        if (alt && !e.altKey) continue;
        if (e.key.toLowerCase() === key) {
          e.preventDefault();
          fn(e);
          return;
        }
      }
    }

    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handler);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handler);
      }
    };
  }, []);
}
