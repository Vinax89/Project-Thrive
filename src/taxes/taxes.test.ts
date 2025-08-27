import { describe, it, expect } from 'vitest';
import { estimateTax, type FilingStatus } from './index';

describe('estimateTax', () => {
  const boundaries: Record<FilingStatus, number[]> = {
    single: [11600, 47150, 100525, 191950, 243725, 609350],
    married_joint: [23200, 94300, 201050, 383900, 487450, 731200],
    married_separate: [11600, 47150, 100525, 191950, 243725, 365600],
    head: [16550, 63100, 100500, 191950, 243700, 609350]
  };

  it('calculates federal tax at bracket boundaries for all filing statuses', () => {
    const results: Record<FilingStatus, number[]> = {
      single: [],
      married_joint: [],
      married_separate: [],
      head: []
    };
    for (const status of Object.keys(boundaries) as FilingStatus[]) {
      results[status] = boundaries[status].map((income) =>
        estimateTax('federal', 2025, income, status)
      );
    }
    expect(results).toMatchSnapshot();
  });

  it('returns 0 for no income across states', () => {
    for (const state of ['federal', 'california', 'oregon']) {
      expect(estimateTax(state, 2025, 0)).toBe(0);
    }
  });

  it('calculates tax for multiple states and years', () => {
    expect(estimateTax('federal', 2025, 1_000_000)).toBe(328187.75);
    expect(estimateTax('california', 2025, 1_000_000)).toBe(104989.14);
    expect(estimateTax('oregon', 2025, 1_000_000)).toBe(97254.5);
    // 2024 uses same tables in tests
    expect(estimateTax('federal', 2024, 1_000_000)).toBe(328187.75);
  });
});
