import { renderHook, act } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import useLocalList from './useLocalList';

beforeEach(() => {
  localStorage.clear();
});

test('falls back to initial value on invalid JSON', () => {
  localStorage.setItem('items', 'not-json');
  const { result } = renderHook(() => useLocalList<string>('items', ['a']));
  expect(result.current[0]).toEqual(['a']);
});

test('swallows storage write errors', () => {
  const { result } = renderHook(() => useLocalList<string>('items', []));
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('fail');
  });
  act(() => result.current[1](['x']));
  expect(result.current[0]).toEqual(['x']);
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
