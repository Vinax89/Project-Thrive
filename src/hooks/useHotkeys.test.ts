import { renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import useHotkeys from './useHotkeys';

function trigger(key: string, opts: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}) {
  const event = new KeyboardEvent('keydown', { key, ...opts });
  window.dispatchEvent(event);
}

test('handles ctrl+enter', () => {
  const fn = vi.fn();
  renderHook(() => useHotkeys([[ 'ctrl+enter', fn ]]));
  trigger('Enter', { ctrlKey: true });
  expect(fn).toHaveBeenCalled();
});

test('ignores when modifiers missing', () => {
  const fn = vi.fn();
  renderHook(() => useHotkeys([[ 'ctrl+enter', fn ]]));
  trigger('Enter');
  expect(fn).not.toHaveBeenCalled();
});

test('supports multiple modifiers case-insensitively', () => {
  const fn = vi.fn();
  renderHook(() => useHotkeys([[ 'Meta+Shift+X', fn ]]));
  trigger('x', { metaKey: true, shiftKey: true });
  expect(fn).toHaveBeenCalled();
});

test('stops after first matching binding', () => {
  const fn1 = vi.fn();
  const fn2 = vi.fn();
  renderHook(() => useHotkeys([
    ['ctrl+k', fn1],
    ['ctrl+k', fn2]
  ]));
  trigger('k', { ctrlKey: true });
  expect(fn1).toHaveBeenCalled();
  expect(fn2).not.toHaveBeenCalled();
});
