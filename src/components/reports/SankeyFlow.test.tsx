// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import SankeyFlow from './SankeyFlow';

describe('SankeyFlow', () => {
  it('preserves DOM nodes when flow order changes', () => {
    const container = document.createElement('div');
    const root = ReactDOM.createRoot(container);

    const flows = [
      { source: 'A', target: 'B', amount: 5 },
      { source: 'C', target: 'D', amount: 10 }
    ];

    act(() => {
      root.render(<SankeyFlow flows={flows} />);
    });

    const wrapper = container.querySelector('div')!;
    const before = Array.from(wrapper.children);

    const reordered = [flows[1], flows[0]];
    act(() => {
      root.render(<SankeyFlow flows={reordered} />);
    });

    const after = Array.from(wrapper.children);

    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });
});
