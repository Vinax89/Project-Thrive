import { describe, it, expect } from 'vitest';
import { estimateOregonTax } from './oregon2025';

describe('estimateOregonTax', () => {
  const boundaries = [4400, 11000, 125000];

  it('calculates tax at bracket boundaries', () => {
    const taxes = boundaries.map((income) => estimateOregonTax(income));
    expect(taxes).toMatchSnapshot();
  });

  it('returns 0 for no income', () => {
    expect(estimateOregonTax(0)).toBe(0);
  });

  it('calculates tax in the top bracket', () => {
    expect(estimateOregonTax(1_000_000)).toBe(97254.5);
  });
});
