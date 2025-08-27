import React, { useEffect, useMemo, useRef, useState } from 'react';
import useHotkeys from '../hooks/useHotkeys';

type Command = { id: string; label: string; action: () => void; keywords?: string; };

export default function CommandPalette({ open, onClose, commands }:{
  open:boolean; onClose:()=>void; commands:Command[];
}) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setTimeout(()=>inputRef.current?.focus(), 0); else setQuery(''); }, [open]);
  useEffect(() => { if (open) setIndex(0); }, [open, query]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      c => c.label.toLowerCase().includes(q) || (c.keywords || '').toLowerCase().includes(q)
    );
  }, [commands, query]);
  const hotkeys = useMemo(() => (
    open ? [
      ['escape', () => onClose()],
      ['arrowdown', () => {
        if (!list.length) return;
        setIndex(i => (i + 1) % list.length);
      }],
      ['arrowup', () => {
        if (!list.length) return;
        setIndex(i => (i - 1 + list.length) % list.length);
      }],
      ['enter', () => {
        const cmd = list[index];
        if (cmd) {
          cmd.action();
          onClose();
        }
      }]
    ] : []
  ), [open, onClose, list, index]);
  useHotkeys(hotkeys);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-xl mx-auto mt-24 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-700">
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Type a command..."
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Esc to close</div>
        </div>
        <div className="bg-white dark:bg-gray-900 max-h-80 overflow-auto">
          {list.map((c, i) => (
            <button
              key={c.id}
              aria-selected={i === index}
              onClick={() => {
                c.action();
                onClose();
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 ${
                i === index ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              {c.label}
            </button>
          ))}
          {!list.length && (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No results</div>
          )}
        </div>
      </div>
    </div>
  );
}
