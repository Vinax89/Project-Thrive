// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { useApiHealth } from '../useApiHealth';

const TestComponent = () => {
  useApiHealth('http://example.com', 1000);
  return null;
};

describe('useApiHealth visibility handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('stops pinging when document is hidden', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => { root.render(<TestComponent />); });

    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(fetch).toHaveBeenCalledTimes(2);

    Object.defineProperty(document, 'hidden', { value: true });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });

    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(fetch).toHaveBeenCalledTimes(2);

    Object.defineProperty(document, 'hidden', { value: false });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    await act(async () => { vi.advanceTimersByTime(0); });
    expect(fetch).toHaveBeenCalledTimes(3);

    root.unmount();
  });
});
