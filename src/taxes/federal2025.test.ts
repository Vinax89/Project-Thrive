import { describe, it, expect } from 'vitest';
import { estimateFederalTax, type FilingStatus } from './federal2025';

describe('estimateFederalTax', () => {
  const boundaries: Record<FilingStatus, number[]> = {
    single: [11600, 47150, 100525, 191950, 243725, 609350],
    married_joint: [23200, 94300, 201050, 383900, 487450, 731200],
    married_separate: [11600, 47150, 100525, 191950, 243725, 365600],
    head: [16550, 63100, 100500, 191950, 243700, 609350]
  };

  it('calculates tax at bracket boundaries for all filing statuses', () => {
    const results: Record<FilingStatus, number[]> = {
      single: [],
      married_joint: [],
      married_separate: [],
      head: []
    };
    for (const status of Object.keys(boundaries) as FilingStatus[]) {
      results[status] = boundaries[status].map((income) => estimateFederalTax(income, status));
    }
    expect(results).toMatchSnapshot();
  });

  it('returns 0 for no income', () => {
    expect(estimateFederalTax(0)).toBe(0);
  });

  it('calculates tax in the top bracket', () => {
    expect(estimateFederalTax(1_000_000)).toBe(328187.75);
  });
});
