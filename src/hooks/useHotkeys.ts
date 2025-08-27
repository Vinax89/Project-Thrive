import { useEffect } from 'react';

export default function useHotkeys(bindings: Array<[string, (e: KeyboardEvent) => void]>) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      for (const [combo, fn] of bindings) {
        const parts = combo.toLowerCase().split('+').map((s) => s.trim());
        const needMeta = parts.includes('meta');
        const needCtrl = parts.includes('ctrl');
        const needShift = parts.includes('shift');
        const key = parts[parts.length - 1];
        if ((needMeta ? e.metaKey : true) &&
            (needCtrl ? e.ctrlKey : true) &&
            (needShift ? e.shiftKey : true) &&
            e.key.toLowerCase() === key) {
          e.preventDefault();
          fn(e);
          return;
        }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bindings]);
}
