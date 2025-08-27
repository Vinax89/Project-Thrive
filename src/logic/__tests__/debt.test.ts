import { describe, it, expect } from 'vitest';
import { payoff } from '../debt';

describe('payoff()', () => {
  it('pays off two debts and decreases interest over time', () => {
    const result = payoff(
      [
        { id: 'a', name: 'A', balance: 1000, apr: 24, minPayment: 25 },
        { id: 'b', name: 'B', balance: 500, apr: 12, minPayment: 25 }
      ],
      200,
      'avalanche',
      240
    );
    expect(result.months).toBeGreaterThan(0);
    expect(result.schedule[result.schedule.length - 1].balances.a).toBe(0);
    expect(result.schedule[result.schedule.length - 1].balances.b).toBe(0);
    const first = result.schedule[0].interest;
    const later = result.schedule[Math.min(6, result.schedule.length - 1)].interest;
    expect(later).toBeLessThanOrEqual(first);
  });

  it('flags infeasible if budget < sum(min payments)', () => {
    const result = payoff(
      [{ id: 'a', name: 'A', balance: 1000, apr: 24, minPayment: 300 }],
      200,
      'avalanche',
      12
    );
    expect(result.months).toBe(0);
    expect(result.schedule[0].unlockedBadges?.[0]).toContain('Budget < sum(min payments)');
  });
});
