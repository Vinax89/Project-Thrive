import { describe, it, expect } from 'vitest';
import { estimateCaliforniaTax } from './california2025';

describe('estimateCaliforniaTax', () => {
  const boundaries = [10412, 24684, 38959, 54082, 68350, 349137, 418961, 698271];

  it('calculates tax at bracket boundaries', () => {
    const taxes = boundaries.map((income) => estimateCaliforniaTax(income));
    expect(taxes).toMatchSnapshot();
  });

  it('returns 0 for no income', () => {
    expect(estimateCaliforniaTax(0)).toBe(0);
  });

  it('calculates tax in the top bracket', () => {
    expect(estimateCaliforniaTax(1_000_000)).toBe(104989.14);
  });
});
